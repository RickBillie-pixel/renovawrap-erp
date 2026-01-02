import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Loader2, Download, X, Check, Search, ChefHat, Square, DoorOpen, Wrench, Box, Mail, User, Send, CheckCircle2, Camera, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWrapColors, type WrapColor } from "@/lib/wrapColors";
import { supabase } from "@/lib/supabase";

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

const Configurator = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [colorSearch, setColorSearch] = useState<string>("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customerData, setCustomerData] = useState({ name: "", email: "", address: "" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Restore state from localStorage on mount and check status
  useEffect(() => {
    const checkStatus = async (id: string) => {
      const { data, error } = await supabase
        .from('submissions')
        .select('result_url')
        .eq('id', id)
        .single();
      
      if (data?.result_url) {
        setGeneratedImage(data.result_url);
        setIsGenerating(false);
        setSubmissionId(null);
        localStorage.removeItem('configuratorState');
        setIsSubmitted(true);
        
        toast({
          title: "Voorbeeld gegenereerd!",
          description: "Het resultaat is opgehaald.",
        });
        return true;
      }
      return false;
    };

    const savedState = localStorage.getItem('configuratorState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      const isRecent = new Date().getTime() - parsed.timestamp < 24 * 60 * 60 * 1000;
      
      if (isRecent && parsed.isGenerating && parsed.submissionId) {
        setSubmissionId(parsed.submissionId);
        setIsGenerating(true);
        setShowContactForm(true);
        setIsSubmitted(true);
        setCustomerData(parsed.customerData);
        if (parsed.uploadedImage) setUploadedImage(parsed.uploadedImage);

        // Check if already completed
        checkStatus(parsed.submissionId);
      }
    }
  }, []);

  // Subscribe to realtime updates for the submission
  useEffect(() => {
    if (!submissionId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `id=eq.${submissionId}`,
        },
        (payload) => {
          console.log('Received update:', payload);
          const newData = payload.new as any;
          if (newData.result_url) {
            setGeneratedImage(newData.result_url);
            setIsGenerating(false);
            setSubmissionId(null); // Stop listening
            localStorage.removeItem('configuratorState'); // Clear saved state
            
            toast({
              title: "Voorbeeld gegenereerd!",
              description: "Het resultaat is klaar en naar uw email verzonden.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [submissionId]);

  
  // Load all wrap colors dynamically
  const allColors = getWrapColors();
  
  // Filter colors based on search
  const filteredColors = allColors.filter(color =>
    color.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
    color.code?.toLowerCase().includes(colorSearch.toLowerCase())
  );

  // Calculate progress
  const progress = [
    uploadedImage,
    selectedApplication,
    selectedColor,
    acceptedTerms,
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
        setShowContactForm(false);
        setIsSubmitted(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({
        title: "Geen afbeelding",
        description: "Upload eerst een afbeelding van uw keuken/kast",
        variant: "destructive",
      });
      return;
    }

    if (!selectedApplication) {
      toast({
        title: "Geen toepassing geselecteerd",
        description: "Selecteer wat u wilt wrappen",
        variant: "destructive",
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: "Geen kleur geselecteerd",
        description: "Selecteer een kleur",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Voorwaarden niet geaccepteerd",
        description: "Accepteer de voorwaarden om door te gaan",
        variant: "destructive",
      });
      return;
    }

    // Show contact form first
    setShowContactForm(true);
    setGeneratedImage(null);
    setIsSubmitted(false);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.email) {
      toast({
        title: "Vul alle velden in",
        description: "Naam en email zijn verplicht",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      toast({
        title: "Ongeldig email adres",
        description: "Controleer uw email adres",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsGenerating(true);

    try {
      // Upload image to Supabase storage
      let imageUrl = uploadedImage;
      
      if (uploadedFile) {
        toast({
          title: "Afbeelding uploaden...",
          description: "Even geduld, uw afbeelding wordt geüpload.",
        });

        const uploadedUrl = await uploadImageToSupabase(uploadedFile);
        if (!uploadedUrl) {
          throw new Error("Kon afbeelding niet uploaden");
        }
        imageUrl = uploadedUrl;
      } else if (!uploadedImage) {
        throw new Error("Geen afbeelding beschikbaar");
      }

      // Get selected service details
      const selectedService = applicationTypes.find(a => a.value === selectedApplication);
      const serviceDetails = selectedService ? {
        value: selectedService.value,
        label: selectedService.label,
        description: selectedService.description
      } : null;

      // Get selected color details
      const selectedColorData = allColors.find(c => c.id === selectedColor);
      
      // Ensure color image URL is absolute
      let colorImageUrl = selectedColorData?.image || '';
      if (colorImageUrl && !colorImageUrl.startsWith('http')) {
        // Remove duplicate slashes if any
        const cleanPath = colorImageUrl.startsWith('/') ? colorImageUrl : `/${colorImageUrl}`;
        colorImageUrl = `${window.location.origin}${cleanPath}`;
      }

      const colorDetails = selectedColorData ? {
        id: selectedColorData.id,
        name: selectedColorData.name,
        code: selectedColorData.code,
        image_url: colorImageUrl
      } : null;

      // Call edge function with anonymous key for authentication
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'submit-configuration',
        {
          body: {
            name: customerData.name,
            email: customerData.email,
            address: customerData.address || null,
            service_details: serviceDetails,
            color_details: colorDetails,
            image_url: imageUrl
          }
        }
      );

      if (functionError) {
        throw functionError;
      }

      const newSubmissionId = functionData.submission_id;
      setSubmissionId(newSubmissionId);

      // Save state to localStorage
      localStorage.setItem('configuratorState', JSON.stringify({
        submissionId: newSubmissionId,
        isGenerating: true,
        timestamp: new Date().getTime(),
        customerData,
        uploadedImage // Warning: this might be large if base64
      }));

      setIsSubmitting(false);
      
      // Show loading message
      toast({
        title: "AI Voorbeeld genereren...",
        description: "Dit duurt ongeveer 1,5 minuten. U ontvangt het resultaat per email. U kunt deze pagina open laten staan.",
      });

      // We remove the setTimeout simulation because we now wait for the webhook/realtime update
      // But we keep a fallback timeout just in case realtime fails or takes too long (optional)
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      setIsGenerating(false);
      toast({
        title: "Fout bij verzenden",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.download = `foxwrap-preview-${Date.now()}.jpg`;
      link.href = generatedImage;
      link.click();
    }
  };

  const canGenerate = uploadedImage && selectedApplication && selectedColor && acceptedTerms;

  return (
    <PageTransition>
      <SEO
        title="AI Configurator - Zie Uw Droomproject Voor U | FoxWrap.nl"
        description="Upload een foto en laat AI een realistisch voorbeeld genereren van uw keuken of interieur met wrap-folie. Ontvang het resultaat direct per email. Probeer nu gratis!"
        keywords="wrap configurator, AI configurator, keuken visualisatie, interieur visualisatie, wrap voorbeeld, AI voorbeeld"
        canonical="https://foxwrap.nl/configurator"
        ogTitle="AI Configurator - Zie Uw Droomproject Voor U"
        ogDescription="Upload een foto en ontvang een realistisch AI-voorbeeld direct per email. Gratis te gebruiken!"
      />
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section with Gradient */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="absolute bottom-0 right-0 w-72 h-72 bg-secondary rounded-full blur-3xl"
            />
          </div>
          
          <div className="container-wide relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant mx-auto">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
              </motion.div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                AI Configurator
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                Zie Uw{" "}
                <span className="text-gradient-primary">Droomproject</span>{" "}
                Voor U
              </h1>
              <p className="text-muted-foreground text-lg">
                Upload een foto en laat AI een realistisch voorbeeld genereren. Ontvang het resultaat direct per email.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Configurator Section */}
        <section className="section-padding bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Progress Indicator */}
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Voortgang</span>
                    <span className="text-sm text-muted-foreground">{progress}/4 stappen</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress / 4) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-primary rounded-full"
                    />
                  </div>
                </div>

                {/* Step 1: Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant hover:shadow-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      1
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Upload Uw Afbeelding
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {uploadedImage ? (
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/30 shadow-elegant group"
                      >
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setUploadedFile(null);
                            setGeneratedImage(null);
                            setShowContactForm(false);
                            setIsSubmitted(false);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                            if (cameraInputRef.current) {
                              cameraInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-elegant"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-primary-foreground text-xs font-medium">
                          <Check className="w-3 h-3 inline mr-1" />
                          Geüpload
                        </div>
                      </motion.div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative aspect-video rounded-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer group bg-gradient-to-br from-primary/5 to-transparent"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:shadow-primary transition-all"
                          >
                            <Upload className="w-10 h-10 text-primary-foreground" />
                          </motion.div>
                          <div className="text-center px-4">
                            <p className="font-medium text-foreground mb-1">
                              Klik om te uploaden
                            </p>
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG of WEBP (max. 10MB)
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
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Foto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Maak Foto
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Step 2: Application Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant hover:shadow-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      2
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Wat Wilt U Wrappen?
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {applicationTypes.map((app) => {
                      const Icon = app.icon;
                      const isSelected = selectedApplication === app.value;
                      return (
                        <motion.button
                          key={app.value}
                          onClick={() => setSelectedApplication(app.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-elegant"
                              : "border-border hover:border-primary/50 bg-background/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 shadow-soft border border-primary/20"
                            >
                              <Icon className="w-6 h-6 text-primary" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-display font-semibold mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {app.label}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {app.description}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-elegant"
                              >
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Step 3: Color Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant hover:shadow-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      3
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Kies Uw Kleur
                    </h2>
                  </div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Zoek op naam of code..."
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-soft"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filteredColors.map((color) => (
                        <motion.button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`group relative aspect-square rounded-xl border-2 overflow-hidden transition-all shadow-soft ${
                            selectedColor === color.id
                              ? "border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-elegant"
                              : "border-border hover:border-primary/50"
                          }`}
                          title={color.name}
                        >
                          <img
                            src={color.image}
                            alt={color.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 text-[10px] font-medium text-card opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {color.name}
                          </div>
                          {selectedColor === color.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-elegant"
                            >
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {filteredColors.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Geen kleuren gevonden voor "{colorSearch}"
                      </p>
                    )}
                  </div>
                  
                  {selectedColor && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary rounded-xl border border-primary/20"
                    >
                      <p className="text-sm font-medium text-foreground">
                        Geselecteerd: {allColors.find(c => c.id === selectedColor)?.name}
                      </p>
                      {allColors.find(c => c.id === selectedColor)?.code && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Code: {allColors.find(c => c.id === selectedColor)?.code}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Step 4: Terms */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant hover:shadow-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      4
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Voorwaarden
                    </h2>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-foreground cursor-pointer leading-relaxed flex-1"
                    >
                      Ik ga akkoord met de{" "}
                      <a href="#" className="text-primary hover:underline font-medium">
                        algemene voorwaarden
                      </a>{" "}
                      en begrijp dat dit een indicatief voorbeeld is. Het eindresultaat kan afwijken van het gegenereerde voorbeeld.
                    </label>
                  </div>
                </motion.div>

                {/* Generate Button - Only show when form is not visible */}
                {!showContactForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={handleGenerate}
                      disabled={!canGenerate || isGenerating}
                      variant="hero"
                      size="xl"
                      className="w-full h-14 text-lg shadow-elegant hover:shadow-primary"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Genereer AI Voorbeeld
                    </Button>
                  </motion.div>
                )}

                {/* Loading State during Generation */}
                <AnimatePresence>
                  {isGenerating && !generatedImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant"
                    >
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-elegant"
                        >
                          <Sparkles className="w-8 h-8 text-primary-foreground" />
                        </motion.div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-2">
                            AI Voorbeeld Genereren
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Dit duurt ongeveer 1,5 minuten. U ontvangt het resultaat ook per email op <strong>{customerData.email}</strong>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generated Image Preview */}
                <AnimatePresence>
                  {generatedImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/30 shadow-elegant mb-4">
                        <img
                          src={generatedImage}
                          alt="AI Generated Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full text-primary-foreground text-xs font-medium flex items-center gap-2 shadow-elegant">
                          <Check className="w-3 h-3" />
                          AI Gegenereerd
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <div className="flex-1 p-4 bg-gradient-to-r from-primary/10 to-secondary rounded-xl border border-primary/20">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Toepassing:</span>
                            <span className="font-medium text-foreground">
                              {applicationTypes.find(a => a.value === selectedApplication)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Kleur:</span>
                            <span className="font-medium text-foreground">
                              {allColors.find(c => c.id === selectedColor)?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contact Form - Show when generate button is clicked */}
                <AnimatePresence>
                  {showContactForm && !isSubmitted && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elegant"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          Ontvang Uw Resultaat
                        </h2>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 text-sm">
                        Vul uw gegevens in om het AI-voorbeeld te genereren. Het resultaat wordt automatisch naar uw email verzonden.
                      </p>

                      <form onSubmit={handleSubmitContact} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Naam
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Uw naam"
                              value={customerData.name}
                              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                              required
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="uw@email.nl"
                              value={customerData.email}
                              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Adres (optioneel)
                          </Label>
                          <Input
                            id="address"
                            type="text"
                            placeholder="Straat, huisnummer, postcode, plaats"
                            value={customerData.address}
                            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                            className="h-11"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || isGenerating}
                          variant="hero"
                          className="w-full h-11"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gegevens verzenden...
                            </>
                          ) : isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              AI Voorbeeld genereren (1,5 min)...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Genereer AI Voorbeeld
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-elegant"
                    >
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-elegant"
                        >
                          <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                        </motion.div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-2">
                            Voorbeeld gegenereerd!
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Het AI-voorbeeld is gegenereerd en verzonden naar <strong>{customerData.email}</strong>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Hoe Werkt Het?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  {
                    step: "1",
                    title: "Upload Foto",
                    description: "Upload een duidelijke foto van uw keuken, kast of meubel",
                  },
                  {
                    step: "2",
                    title: "Kies Opties",
                    description: "Selecteer wat u wilt wrappen en uw gewenste kleur",
                  },
                  {
                    step: "3",
                    title: "Ontvang Resultaat",
                    description: "AI genereert een voorbeeld en u ontvangt het per email",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
                      <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
};

export default Configurator;
