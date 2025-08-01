import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, MousePointer, Keyboard, Lightbulb } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">How to Use ALCPT Practice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Play className="text-primary mr-2" />
              Audio Controls
            </h3>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li>• Click the play button to start the audio</li>
              <li>• Adjust volume and playback speed as needed</li>
              <li>• You can replay the audio multiple times</li>
              <li>• Use keyboard shortcuts: Spacebar to play/pause</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <MousePointer className="text-primary mr-2" />
              Answering Questions
            </h3>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li>• Listen to the audio carefully</li>
              <li>• Select one of the four answer options (A, B, C, D)</li>
              <li>• Click "Submit Answer" to check your response</li>
              <li>• Review the feedback and explanation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Keyboard className="text-primary mr-2" />
              Keyboard Shortcuts
            </h3>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li>• <kbd className="bg-muted px-2 py-1 rounded text-sm">1-4</kbd> Select answers A-D</li>
              <li>• <kbd className="bg-muted px-2 py-1 rounded text-sm">Enter</kbd> Submit answer</li>
              <li>• <kbd className="bg-muted px-2 py-1 rounded text-sm">Space</kbd> Play/pause audio</li>
              <li>• <kbd className="bg-muted px-2 py-1 rounded text-sm">Esc</kbd> Close this help dialog</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Lightbulb className="text-primary mr-2" />
              Tips for Success
            </h3>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li>• Listen to the entire audio before selecting an answer</li>
              <li>• Pay attention to key words and context clues</li>
              <li>• Use the replay function if you missed something</li>
              <li>• Read all answer options before making your choice</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Got it, let's practice!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
