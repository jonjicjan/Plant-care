import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, ImagePlus, Loader2, Leaf, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import PlantPhoto from '@/components/PlantPhoto';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PLANT_TYPES, toDate } from '@/lib/plantCare';

const MAX_BYTES = 8 * 1024 * 1024;

export default function PlantForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    plantName: '',
    plantType: PLANT_TYPES[0],
    dateAdded: format(new Date(), 'yyyy-MM-dd'),
    imageUrl: '',
    notes: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    base44.entities.Plant.get(id)
      .then((plant) => {
        if (!active) return;
        if (!plant) {
          setLoadError('This plant could not be found.');
          return;
        }
        setForm({
          plantName: plant.plantName || '',
          plantType: plant.plantType || PLANT_TYPES[0],
          dateAdded: plant.dateAdded ? format(toDate(plant.dateAdded), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          imageUrl: plant.imageUrl || '',
          notes: plant.notes || '',
        });
      })
      .catch(() => {
        if (active) setLoadError('This plant could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Please choose an image file.' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Images must be smaller than 8 MB.' }));
      return;
    }
    setUploading(true);
    setErrors((prev) => ({ ...prev, imageUrl: '' }));
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((prev) => ({ ...prev, imageUrl: file_uri }));
    } catch {
      setErrors((prev) => ({ ...prev, imageUrl: 'The photo could not be uploaded. Please try again.' }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    const name = form.plantName.trim();
    if (!name) next.plantName = 'Give your plant a name.';
    else if (name.length < 2) next.plantName = 'Use at least 2 characters.';
    if (!form.plantType) next.plantType = 'Pick a plant type.';
    if (!form.dateAdded) next.dateAdded = 'Choose the date you added this plant.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        plantName: name,
        plantType: form.plantType,
        dateAdded: form.dateAdded,
        imageUrl: form.imageUrl || '',
        notes: form.notes.trim(),
      };
      if (isEdit) {
        await base44.entities.Plant.update(id, payload);
        toast({ title: 'Plant updated', description: name });
        navigate(`/plants/${id}`);
      } else {
        const me = await base44.auth.me();
        const created = await base44.entities.Plant.create({ ...payload, userId: me.id });
        toast({ title: 'Plant added', description: `${name} is now in your collection.` });
        navigate(created?.id ? `/plants/${created.id}` : '/plants');
      }
    } catch (err) {
      setFormError(err?.message || 'We could not save this plant. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading plant" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in-50 duration-500">
      <Link
        to={isEdit ? `/plants/${id}` : '/plants'}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <PageHeader
        eyebrow={isEdit ? 'Edit plant' : 'Add plant'}
        title={isEdit ? 'Update plant details' : 'Add a new plant'}
        description="A few details now make every future reminder smarter."
      />

      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{loadError}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]" noValidate>
        <section className="card-surface space-y-3 p-5">
          <p className="text-sm font-semibold">Plant photo</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/35 bg-white/[0.03] transition hover:border-primary/70 hover:bg-primary/[0.06]"
            style={{ aspectRatio: '4 / 3' }}
          >
            {form.imageUrl ? (
              <PlantPhoto
                uri={form.imageUrl}
                plantType={form.plantType}
                alt={form.plantName || 'Plant photo'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-2 px-4 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <span className="text-sm font-semibold text-foreground">{uploading ? 'Uploading…' : 'Upload a photo'}</span>
                <span className="text-xs text-muted-foreground">JPG or PNG, up to 8 MB</span>
              </span>
            )}
            {form.imageUrl ? (
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-background/80 py-1.5 text-center text-xs font-semibold text-primary backdrop-blur transition group-hover:bg-background">
                Replace photo
              </span>
            ) : null}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} id="plant-photo" />
          <p className="text-xs text-muted-foreground">Stored privately to your account.</p>
          {form.imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full rounded-full text-muted-foreground hover:text-destructive"
              onClick={() => setField('imageUrl', '')}
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              Remove photo
            </Button>
          ) : null}
          {errors.imageUrl ? <p className="text-xs text-destructive">{errors.imageUrl}</p> : null}
        </section>

        <section className="card-surface space-y-4 p-5 sm:p-6">
          <div>
            <label htmlFor="plant-name" className="mb-1.5 block text-sm font-semibold">
              Plant name <span className="text-destructive">*</span>
            </label>
            <input
              id="plant-name"
              className="field-shell"
              value={form.plantName}
              onChange={(event) => setField('plantName', event.target.value)}
              placeholder="Monstera deliciosa"
              aria-invalid={Boolean(errors.plantName)}
              aria-describedby={errors.plantName ? 'plant-name-error' : undefined}
            />
            {errors.plantName ? (
              <p id="plant-name-error" className="mt-1 text-xs text-destructive">
                {errors.plantName}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="plant-type" className="mb-1.5 block text-sm font-semibold">
                Plant category
              </label>
              <select
                id="plant-type"
                className="field-shell"
                value={form.plantType}
                onChange={(event) => setField('plantType', event.target.value)}
              >
                {PLANT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="plant-date" className="mb-1.5 block text-sm font-semibold">
                Date added
              </label>
              <input
                id="plant-date"
                type="date"
                className="field-shell"
                value={form.dateAdded}
                onChange={(event) => setField('dateAdded', event.target.value)}
                aria-invalid={Boolean(errors.dateAdded)}
              />
              {errors.dateAdded ? <p className="mt-1 text-xs text-destructive">{errors.dateAdded}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="plant-notes" className="mb-1.5 block text-sm font-semibold">
              Notes
            </label>
            <textarea
              id="plant-notes"
              rows={5}
              className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
              value={form.notes}
              onChange={(event) => setField('notes', event.target.value)}
              placeholder="Bright indirect light, let the soil dry out between waterings…"
            />
          </div>

          {formError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border"
              onClick={() => navigate(isEdit ? `/plants/${id}` : '/plants')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary rounded-full text-primary-foreground" disabled={saving || uploading}>
              <Leaf className="mr-2 h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save plant'}
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}