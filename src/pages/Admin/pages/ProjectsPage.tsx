import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  ImageIcon,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Upload,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  name: string;
  date: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  category: string | null;
  is_featured: boolean | null;
  Uitdaging: string | null;
  Oplossing: string | null;
}

const defaultForm = {
  name: "",
  date: "",
  before_image_url: "",
  after_image_url: "",
  category: "Keuken Wrapping",
  is_featured: false,
  Uitdaging: "",
  Oplossing: "",
};

const CATEGORY_OPTIONS = [
  "Keuken Wrapping",
  "Keuken Frontjes",
  "Aanrechtbladen",
  "Achterwanden",
  "Kasten",
  "Deuren",
  "Kozijnen",
  "Schadeherstel",
];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingField, setUploadingField] = useState<"before" | "after" | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setProjects((data as Project[]) || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      console.error("Error fetching projects:", error);
      toast({
        title: "Fout bij ophalen projecten",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreate = () => {
    setEditingProject(null);
    setFormData(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name ?? "",
      date: project.date ? project.date.slice(0, 10) : "",
      before_image_url: project.before_image_url ?? "",
      after_image_url: project.after_image_url ?? "",
      category: project.category ?? "Keuken Wrapping",
      is_featured: project.is_featured ?? false,
      Uitdaging: project.Uitdaging ?? "",
      Oplossing: project.Oplossing ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Naam verplicht",
        description: "Vul een projectnaam in",
        variant: "destructive",
      });
      return;
    }
    if (!formData.after_image_url.trim()) {
      toast({
        title: "Resultaat URL verplicht",
        description: "Vul een resultaat-URL (na-afbeelding) in of upload een afbeelding",
        variant: "destructive",
      });
      return;
    }
    if (!formData.category?.trim()) {
      toast({
        title: "Categorie verplicht",
        description: "Selecteer een categorie",
        variant: "destructive",
      });
      return;
    }

    const featuredCount = projects.filter((p) => p.is_featured).length;
    const currentWasFeatured = editingProject?.is_featured ?? false;
    const newFeaturedCount = featuredCount - (currentWasFeatured ? 1 : 0) + (formData.is_featured ? 1 : 0);
    if (formData.is_featured && newFeaturedCount > 3) {
      toast({
        title: "Maximaal 3 uitgelichte projecten",
        description: "Er kunnen maximaal 3 projecten uitgelicht worden. Zet bij een ander project 'Uitgelicht' uit.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        date: formData.date || null,
        before_image_url: formData.before_image_url.trim() || null,
        after_image_url: formData.after_image_url.trim() || null,
        category: formData.category || "Keuken Wrapping",
        is_featured: formData.is_featured,
        Uitdaging: formData.Uitdaging.trim() || null,
        Oplossing: formData.Oplossing.trim() || null,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProject.id);

        if (error) throw error;
        toast({
          title: "Project bijgewerkt",
          description: "Het project is opgeslagen.",
        });
      } else {
        const { error } = await supabase.from("projects").insert(payload);

        if (error) throw error;
        toast({
          title: "Project toegevoegd",
          description: "Het project is aangemaakt.",
        });
      }

      setModalOpen(false);
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Opslaan mislukt";
      console.error("Error saving project:", error);
      toast({
        title: "Fout bij opslaan",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Upload een afbeelding kleiner dan 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingField(field);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("contact-uploads")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("contact-uploads").getPublicUrl(fileName);
      setFormData((prev) => ({
        ...prev,
        [field === "before" ? "before_image_url" : "after_image_url"]: data.publicUrl,
      }));
      toast({
        title: "Afbeelding geüpload",
        description: "De afbeelding is toegevoegd.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload mislukt";
      toast({
        title: "Fout bij uploaden",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectToDelete.id);

      if (error) throw error;

      toast({
        title: "Project verwijderd",
        description: "Het project is verwijderd.",
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verwijderen mislukt";
      toast({
        title: "Fout bij verwijderen",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projecten</h2>
          <p className="text-muted-foreground">Beheer portfolio: voor/na afbeeldingen, categorie en uitdaging/oplossing</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuw project
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Projecten laden...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nog geen projecten</p>
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Eerste project toevoegen
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-foreground w-24">Afbeeldingen</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Naam</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Datum</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Categorie</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground w-20">Uitgelicht</th>
                  <th className="w-28 p-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {projects.map((project) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex gap-2">
                          <div className="w-14 h-14 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                            {project.before_image_url ? (
                              <img
                                src={project.before_image_url}
                                alt="Voor"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                Voor
                              </div>
                            )}
                          </div>
                          <div className="w-14 h-14 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                            {project.after_image_url ? (
                              <img
                                src={project.after_image_url}
                                alt="Na"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                Na
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{project.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {project.date
                          ? format(new Date(project.date), "d MMM yyyy", { locale: nl })
                          : "-"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {project.category ?? "-"}
                      </td>
                      <td className="p-4">
                        {project.is_featured ? (
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(project)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerken
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(project)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={fetchProjects} disabled={isLoading}>
        <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
        Vernieuwen
      </Button>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Project bewerken" : "Nieuw project"}</DialogTitle>
            <DialogDescription>
              Vul de gegevens in. Voor- en na-foto’s kun je als URL invullen of uploaden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Projectnaam"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Categorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Uitgelicht</Label>
                <p className="text-sm text-muted-foreground">
                  Maximaal 3 projecten kunnen uitgelicht worden. Zet aan om dit project op het portfolio uit te lichten.
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                disabled={
                  !formData.is_featured &&
                  projects.filter((p) => p.is_featured).length - (editingProject?.is_featured ? 1 : 0) >= 3
                }
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked === true })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Voor afbeelding (URL of upload)</Label>
                <Input
                  value={formData.before_image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, before_image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Upload
                    className={cn("w-4 h-4", uploadingField === "before" && "animate-pulse")}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "before")}
                    disabled={!!uploadingField}
                  />
                  {uploadingField === "before" ? "Uploaden..." : "Upload bestand"}
                </label>
                {formData.before_image_url && (
                  <div className="mt-2 w-full h-24 rounded border border-border overflow-hidden bg-muted">
                    <img
                      src={formData.before_image_url}
                      alt="Voor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Resultaat URL (na-afbeelding) *</Label>
                <Input
                  value={formData.after_image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, after_image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Upload
                    className={cn("w-4 h-4", uploadingField === "after" && "animate-pulse")}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "after")}
                    disabled={!!uploadingField}
                  />
                  {uploadingField === "after" ? "Uploaden..." : "Upload bestand"}
                </label>
                {formData.after_image_url && (
                  <div className="mt-2 w-full h-24 rounded border border-border overflow-hidden bg-muted">
                    <img
                      src={formData.after_image_url}
                      alt="Na"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="uitdaging">Uitdaging</Label>
              <Textarea
                id="uitdaging"
                value={formData.Uitdaging}
                onChange={(e) => setFormData({ ...formData, Uitdaging: e.target.value })}
                placeholder="Wat was de uitdaging?"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="oplossing">Oplossing</Label>
              <Textarea
                id="oplossing"
                value={formData.Oplossing}
                onChange={(e) => setFormData({ ...formData, Oplossing: e.target.value })}
                placeholder="Hoe is dit opgelost?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  "Opslaan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Project verwijderen</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan
                worden gemaakt.
                {projectToDelete && (
                  <div className="mt-2 p-2 bg-secondary/50 rounded text-sm text-foreground">
                    <strong>Naam:</strong> {projectToDelete.name}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Verwijderen..." : "Verwijderen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
