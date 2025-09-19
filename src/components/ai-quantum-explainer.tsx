"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Atom, 
  Zap, 
  Target, 
  BookOpen,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Activity,
  Globe
} from "lucide-react";

interface QuantumConcept {
  id: string;
  title: string;
  emoji: string;
  description: string;
  analogy: string;
  applications: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedConcepts: string[];
}

const quantumConcepts: QuantumConcept[] = [
  {
    id: 'superposition',
    title: 'Quantum Superposition',
    emoji: '🌊',
    description: 'A quantum state where a qubit exists in multiple states simultaneously until measured.',
    analogy: 'Like a coin spinning in the air - it\'s both heads and tails until it lands!',
    applications: ['Quantum algorithms', 'Parallel computation', 'Quantum advantage'],
    difficulty: 'beginner',
    relatedConcepts: ['Measurement', 'Hadamard Gate', 'Quantum Parallelism']
  },
  {
    id: 'entanglement',
    title: 'Quantum Entanglement',
    emoji: '🔗',
    description: 'Quantum correlation between particles that persists regardless of distance.',
    analogy: 'Like magical coins that always land on opposite sides, no matter how far apart!',
    applications: ['Quantum communication', 'Quantum cryptography', 'Bell states'],
    difficulty: 'intermediate',
    relatedConcepts: ['Bell States', 'Non-locality', 'Quantum Correlation']
  },
  {
    id: 'measurement',
    title: 'Quantum Measurement',
    emoji: '📊',
    description: 'The process of observing a quantum state, causing it to collapse to a definite value.',
    analogy: 'Like opening Schrödinger\'s box - the act of looking determines the outcome!',
    applications: ['State verification', 'Result extraction', 'Quantum algorithms'],
    difficulty: 'beginner',
    relatedConcepts: ['Wave Function Collapse', 'Born Rule', 'Quantum Probability']
  },
  {
    id: 'interference',
    title: 'Quantum Interference',
    emoji: '🌀',
    description: 'Quantum amplitudes can add constructively or destructively, like waves.',
    analogy: 'Like sound waves that can amplify or cancel each other out!',
    applications: ['Quantum algorithms', 'Error correction', 'Optimization'],
    difficulty: 'advanced',
    relatedConcepts: ['Quantum Amplitudes', 'Phase', 'Quantum Algorithms']
  }
];

interface AIQuantumExplainerProps {
  selectedConcept?: string;
  onConceptSelect?: (concept: string) => void;
}

export default function AIQuantumExplainer({ selectedConcept, onConceptSelect }: AIQuantumExplainerProps) {
  const [activeConcept, setActiveConcept] = useState<QuantumConcept | null>(null);
  const [showAIExplanation, setShowAIExplanation] = useState(false);

  const handleConceptClick = (concept: QuantumConcept) => {
    setActiveConcept(concept);
    setShowAIExplanation(true);
    onConceptSelect?.(concept.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-400/50';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/50';
      case 'advanced': return 'text-red-400 border-red-400/50';
      default: return 'text-blue-400 border-blue-400/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Concept Grid */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Atom className="h-6 w-6 text-primary" />
            Quantum Concepts Explorer
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {quantumConcepts.map((concept, index) => (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    activeConcept?.id === concept.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleConceptClick(concept)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{concept.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{concept.title}</h4>
                          <Badge variant="outline" className={getDifficultyColor(concept.difficulty)}>
                            {concept.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {concept.description}
                        </p>
                        <div className="text-xs text-primary font-medium">
                          💡 {concept.analogy}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Explanation Panel */}
      <AnimatePresence>
        {showAIExplanation && activeConcept && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="quantum-card border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    SpikingBrain Explains: {activeConcept.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAIExplanation(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Main Explanation */}
                <Alert className="border-blue-500/30 bg-blue-500/5">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold text-blue-400 mb-2">
                      {activeConcept.emoji} {activeConcept.title}
                    </div>
                    <div className="text-blue-200/90 mb-3">
                      {activeConcept.description}
                    </div>
                    <div className="text-sm text-blue-200/80">
                      <strong>Think of it like this:</strong> {activeConcept.analogy}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Applications */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Real-World Applications
                  </h4>
                  <div className="grid gap-2">
                    {activeConcept.applications.map((app, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <span className="text-sm">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Concepts */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Related Concepts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeConcept.relatedConcepts.map((concept, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          const relatedConcept = quantumConcepts.find(c => 
                            c.title.toLowerCase().includes(concept.toLowerCase())
                          );
                          if (relatedConcept) {
                            handleConceptClick(relatedConcept);
                          }
                        }}
                      >
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="quantum-button flex-1" asChild>
                    <a href="/dashboard/ai">
                      <Brain className="h-4 w-4 mr-2" />
                      Ask SpikingBrain
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="/dashboard/create">
                      <Atom className="h-4 w-4 mr-2" />
                      Try Algorithm
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}