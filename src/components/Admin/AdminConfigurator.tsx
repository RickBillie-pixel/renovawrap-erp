import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Loader2, Download, X, Check, Search, ChefHat, Square, DoorOpen, Wrench, Box, Camera, CheckCircle2, RefreshCw, Trash2, Maximize2, Clock, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWrapColors } from "@/lib/wrapColors";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const applicationTypes = [
  { 
    value: "keukens", 
    label: "Keukens", 
    description: "Kastdeuren, fronten en panelen",
    icon: ChefHat,
  },
  { 
    value: "aanrechtbladen", 
    label: "Aanrechtbladen", 
    description: "Werkbladen en aanrecht oppervlakken",
    icon: Square,
  },
  { 
    value: "kozijnen", 
    label: "Kozijnen", 
    description: "Raam- en deurkozijnen",
    icon: DoorOpen,
  },
  { 
    value: "deuren", 
    label: "Deuren", 
    description: "Binnen- en buitendeuren",
    icon: DoorOpen,
  },
  { 
    value: "schadeherstel", 
    label: "Schadeherstel", 
    description: "Reparatie van beschadigde oppervlakken",
    icon: Wrench,
  },
  { 
    value: "kasten", 
    label: "(Inbouw)Kasten", 
    description: "Wandkasten, inbouwkasten en meubels",
    icon: Box,
  },
];

interface SavedCreation {
  id: string;
  created_at: string;
  image_url: string;
  result_url?: string;
  service_details: any;
  color_details: any;
  status: string;
}

export const AdminConfigurator = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [colorSearch, setColorSearch] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [savedCreations, setSavedCreations] = useState<SavedCreation[]>([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creationToDelete, setCreationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<SavedCreation | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [activeTab, setActiveTab] = useState("create");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to realtime updates for the submission
  useEffect(() => {
    if (!submissionId) return;

    const channel = supabase
      .channel('schema-db-changes-admin')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_configurations',
          filter: `id=eq.${submissionId}`,
        },
        (payload) => {
          console.log('Received update:', payload);
          const newData = payload.new as any;
          if (newData.result_url) {
            setGeneratedImage(newData.result_url);
            setIsGenerating(false);
            setSubmissionId(null);
            
            toast({
              title: "Voorbeeld gegenereerd!",
              description: "Het resultaat is klaar.",
            });
            fetchSavedCreations(); // Refresh list
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [submissionId]);

  const fetchSavedCreations = async () => {
    setIsLoadingCreations(true);
    try {
      const { data, error } = await supabase
        .from('admin_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCreations(data || []);
    } catch (error) {
      console.error('Error fetching creations:', error);
    } finally {
      setIsLoadingCreations(false);
    }
  };

  useEffect(() => {
    fetchSavedCreations();
  }, []);

  const allColors = getWrapColors();
  
  const filteredColors = allColors.filter(color =>
    color.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
    color.code?.toLowerCase().includes(colorSearch.toLowerCase())
  );

  const progress = [
    uploadedImage,
    selectedApplication,
    selectedColor,
  ].filter(Boolean).length;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Bestand te groot",
          description: "Upload een afbeelding kleiner dan 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `admin-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('configurator-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('configurator-uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedApplication || !selectedColor) {
      toast({
        title: "Incompleet",
        description: "Vul alle velden in",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setLoadingStep("upload");

    try {
      let imageUrl = uploadedImage;
      
      // Step 1: Upload image
      if (uploadedFile) {
        setLoadingStep("upload");
        toast({
          title: "Afbeelding uploaden...",
          description: "Uw afbeelding wordt geüpload naar de server.",
        });
        
        const uploadedUrl = await uploadImageToSupabase(uploadedFile);
        if (!uploadedUrl) {
          throw new Error("Kon afbeelding niet uploaden. Probeer het opnieuw.");
        }
        imageUrl = uploadedUrl;
      }

      // Step 2: Prepare data
      setLoadingStep("prepare");
      const selectedService = applicationTypes.find(a => a.value === selectedApplication);
      const serviceDetails = selectedService ? {
        value: selectedService.value,
        label: selectedService.label,
        description: selectedService.description
      } : null;

      const selectedColorData = allColors.find(c => c.id === selectedColor);
      let colorImageUrl = selectedColorData?.image || '';
      if (colorImageUrl && !colorImageUrl.startsWith('http')) {
        const cleanPath = colorImageUrl.startsWith('/') ? colorImageUrl : `/${colorImageUrl}`;
        colorImageUrl = `${window.location.origin}${cleanPath}`;
      }

      const colorDetails = selectedColorData ? {
        id: selectedColorData.id,
        name: selectedColorData.name,
        code: selectedColorData.code,
        image_url: colorImageUrl
      } : null;

      // Step 3: Send to webhook
      setLoadingStep("webhook");
      toast({
        title: "Verzenden naar AI...",
        description: "Uw creatie wordt naar de AI service gestuurd.",
      });

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'submit-admin-configuration',
        {
          body: {
            service_details: serviceDetails,
            color_details: colorDetails,
            image_url: imageUrl
          }
        }
      );

      if (functionError) {
        // Better error handling - don't show raw Supabase errors
        const errorMessage = functionError.message || "Er is een fout opgetreden";
        let userFriendlyMessage = "Er is een fout opgetreden bij het verzenden.";
        
        if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
          userFriendlyMessage = "Authenticatie mislukt. Log opnieuw in.";
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          userFriendlyMessage = "Netwerkfout. Controleer uw internetverbinding.";
        } else if (errorMessage.includes("timeout")) {
          userFriendlyMessage = "De aanvraag duurde te lang. Probeer het opnieuw.";
        }
        
        throw new Error(userFriendlyMessage);
      }

      // Success - show dialog
      setSubmissionId(functionData.submission_id);
      setLoadingStep("success");
      setIsGenerating(false);
      setSuccessDialogOpen(true);
      
      toast({
        title: "Succesvol verzonden!",
        description: "Uw creatie is naar de AI service gestuurd.",
      });
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setIsGenerating(false);
      setLoadingStep("");
      
      toast({
        title: "Fout bij genereren",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string) => {
    if (url) {
      const link = document.createElement("a");
      link.download = `renovawrap-admin-${Date.now()}.jpg`;
      link.href = url;
      link.target = "_blank";
      link.click();
    }
  };

  const handleViewCreation = (creation: SavedCreation) => {
    setSelectedCreation(creation);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCreationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deleteCreation = async () => {
    if (!creationToDelete) return;

    setIsDeleting(true);
    
    // Optimistic update
    setSavedCreations(prev => prev.filter(c => c.id !== creationToDelete));
    setDeleteDialogOpen(false);

    try {
      const { error } = await supabase
        .from('admin_configurations')
        .delete()
        .eq('id', creationToDelete);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "De creatie is succesvol verwijderd.",
      });
    } catch (error: any) {
      console.error('Error deleting creation:', error);
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
      // Revert optimistic update
      fetchSavedCreations();
    } finally {
      setIsDeleting(false);
      setCreationToDelete(null);
    }
  };

  const canGenerate = uploadedImage && selectedApplication && selectedColor;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="create">Nieuwe Creatie</TabsTrigger>
          <TabsTrigger value="history">Jouw Creaties</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Voortgang</span>
            <span className="text-sm text-muted-foreground">{progress}/3 stappen</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-primary rounded-full"
            />
          </div>

          {/* Step 1: Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Upload Afbeelding
              </h2>
            </div>
            
            <div className="space-y-4">
              {uploadedImage ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/30 group"
                >
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedFile(null);
                      setGeneratedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video rounded-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer group bg-secondary/5"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-sm">
                      <Upload className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-medium text-foreground mb-1">
                        Klik om te uploaden
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Step 2: Application */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Toepassing
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {applicationTypes.map((app) => {
                const Icon = app.icon;
                const isSelected = selectedApplication === app.value;
                return (
                  <button
                    key={app.value}
                    onClick={() => setSelectedApplication(app.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {app.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {app.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Step 3: Color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Kleur
              </h2>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Zoek kleur..."
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                      selectedColor === color.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    title={color.name}
                  >
                    <img
                      src={color.image}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedColor === color.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            variant="hero"
            size="lg"
            className="w-full text-lg h-14"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {loadingStep === "upload" && "Afbeelding uploaden..."}
                {loadingStep === "prepare" && "Voorbereiden..."}
                {loadingStep === "webhook" && "Verzenden naar AI..."}
                {!loadingStep && "Genereren..."}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Genereer Voorbeeld
              </>
            )}
          </Button>

          {/* Loading State with Progress */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant shrink-0"
                  >
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {loadingStep === "upload" && "Afbeelding uploaden"}
                      {loadingStep === "prepare" && "Gegevens voorbereiden"}
                      {loadingStep === "webhook" && "Verzenden naar AI service"}
                      {loadingStep === "success" && "Succesvol verzonden!"}
                      {!loadingStep && "Bezig met verwerken..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {loadingStep === "upload" && "Uw afbeelding wordt geüpload naar de server..."}
                      {loadingStep === "prepare" && "Uw selecties worden voorbereid..."}
                      {loadingStep === "webhook" && "De creatie wordt naar de AI service gestuurd..."}
                      {loadingStep === "success" && "Uw creatie is succesvol verzonden!"}
                      {!loadingStep && "Even geduld..."}
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: loadingStep === "upload" ? "33%" : 
                              loadingStep === "prepare" ? "66%" : 
                              loadingStep === "webhook" ? "100%" : "0%"
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Generated Result */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/30 mb-4">
                  <img
                    src={generatedImage}
                    alt="AI Result"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-primary/90 rounded-full text-primary-foreground text-xs font-medium flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Gegenereerd
                  </div>
                </div>
                
                <Button
                  onClick={() => handleDownload(generatedImage)}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resultaat
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Opgeslagen Creaties</h3>
              <Button variant="outline" size="sm" onClick={fetchSavedCreations} disabled={isLoadingCreations}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingCreations ? 'animate-spin' : ''}`} />
                Verversen
              </Button>
            </div>

            {isLoadingCreations ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Laden...
              </div>
            ) : savedCreations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nog geen creaties opgeslagen.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCreations.map((creation) => (
                  <div key={creation.id} className="border border-border rounded-xl overflow-hidden bg-background group">
                    <div 
                      className="aspect-video relative bg-secondary/20 cursor-pointer"
                      onClick={() => creation.result_url && handleViewCreation(creation)}
                    >
                      {creation.result_url ? (
                        <img 
                          src={creation.result_url} 
                          alt="AI Result" 
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs">Bezig met genereren...</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur rounded text-xs font-medium">
                        {format(new Date(creation.created_at), "dd MMM HH:mm", { locale: nl })}
                      </div>
                      {creation.result_url && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium truncate ml-2">
                          {creation.service_details?.label || creation.service_details?.value}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kleur:</span>
                        <span className="font-medium truncate ml-2">
                          {creation.color_details?.name}
                        </span>
                      </div>
                      <div className="pt-2 flex gap-2">
                        {creation.result_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownload(creation.result_url!)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(creation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Creatie verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze creatie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCreation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Verwijderen..." : "Verwijderen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Creatie Details</DialogTitle>
            <DialogDescription>
              Bekijk de gegenereerde afbeelding en de bijbehorende details.
            </DialogDescription>
          </DialogHeader>
          {selectedCreation && (
            <div className="space-y-4">
              <div className="relative w-full rounded-lg overflow-hidden border-2 border-border">
                {selectedCreation.result_url ? (
                  <img 
                    src={selectedCreation.result_url} 
                    alt="AI Result" 
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground flex-col gap-2">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <span>Bezig met genereren...</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service</p>
                  <p className="font-medium">
                    {selectedCreation.service_details?.label || selectedCreation.service_details?.value}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kleur</p>
                  <p className="font-medium">
                    {selectedCreation.color_details?.name}
                    {selectedCreation.color_details?.code && ` (${selectedCreation.color_details.code})`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Datum</p>
                  <p className="font-medium">
                    {format(new Date(selectedCreation.created_at), "dd MMMM yyyy 'om' HH:mm", { locale: nl })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{selectedCreation.status}</p>
                </div>
              </div>
              {selectedCreation.result_url && (
                <Button
                  onClick={() => handleDownload(selectedCreation.result_url!)}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resultaat
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog - "Over 1 minuut is uw creatie klaar" */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant"
            >
              <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="text-center text-2xl">Creatie Verzonden!</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Uw creatie is succesvol naar de AI service gestuurd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Over ongeveer 1 minuut</p>
                <p className="text-sm text-muted-foreground">is uw creatie klaar en zichtbaar in "Jouw Creaties"</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Send className="w-4 h-4" />
              <span>De pagina wordt automatisch bijgewerkt wanneer het resultaat klaar is.</span>
            </div>
            <Button
              onClick={() => {
                setSuccessDialogOpen(false);
                setActiveTab("history");
                fetchSavedCreations();
              }}
              variant="hero"
              className="w-full"
            >
              Bekijk Jouw Creaties
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
