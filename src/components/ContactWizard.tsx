import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Check, Upload, Home, Building2, Sofa, Camera } from "lucide-react";

type WizardStep = 1 | 2 | 3 | 4;

interface FormData {
  type: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  photos: File[];
}

const projectTypes = [
  { id: "keuken", label: "Keuken Wrappen", icon: Home },
  { id: "interieur", label: "Interieur Wrappen", icon: Sofa },
  { id: "zakelijk", label: "Zakelijk Project", icon: Building2 },
];

export const ContactWizard = () => {
  const [step, setStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    photos: [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, photos: Array.from(e.target.files) });
    }
  };

  const handleSubmit = () => {
    // Here you would send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
  };

  const nextStep = () => {
    if (step < 4) setStep((step + 1) as WizardStep);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
          Bedankt voor uw aanvraag!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Wij nemen binnen 24 uur contact met u op om uw project te bespreken.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold transition-all ${
                s <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-colors ${
                  s < step ? "bg-primary" : "bg-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-[300px]"
      >
        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Wat wilt u laten wrappen?
            </h3>
            <p className="text-muted-foreground mb-8">
              Kies het type project waarvoor u een offerte wilt ontvangen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.type === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <type.icon className="w-8 h-8 text-primary mb-4" />
                  <div className="font-display font-semibold">{type.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Upload Photos */}
        {step === 2 && (
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Upload foto's (optioneel)
            </h3>
            <p className="text-muted-foreground mb-8">
              Stuur ons foto's van uw huidige situatie voor een nauwkeurige offerte.
            </p>
            <label className="block">
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 text-center cursor-pointer transition-colors bg-card">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="font-medium mb-2">
                  Klik om foto's te uploaden
                </div>
                <div className="text-sm text-muted-foreground">
                  Of sleep bestanden hierheen
                </div>
                {formData.photos.length > 0 && (
                  <div className="mt-4 text-primary font-medium">
                    {formData.photos.length} foto('s) geselecteerd
                  </div>
                )}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Uw contactgegevens
            </h3>
            <p className="text-muted-foreground mb-8">
              Vul uw gegevens in zodat wij contact met u kunnen opnemen.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Naam *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Uw volledige naam"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-mail *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="uw@email.nl"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefoonnummer
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+31 6 12345678"
                  className="bg-card border-border"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Message */}
        {step === 4 && (
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Extra informatie
            </h3>
            <p className="text-muted-foreground mb-8">
              Vertel ons meer over uw project en eventuele specifieke wensen.
            </p>
            <Textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Beschrijf uw project, afmetingen, gewenste kleur of finish..."
              rows={6}
              className="bg-card border-border"
            />
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      {step > 1 && (
        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={prevStep} className="group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Vorige
          </Button>
          {step < 4 ? (
            <Button variant="gold" onClick={nextStep} className="group">
              Volgende
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email}
              className="group"
            >
              Verstuur Aanvraag
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
