"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeatureNoticeDialogProps {
  featureName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureNoticeDialog({
  featureName,
  isOpen,
  onClose,
}: FeatureNoticeDialogProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFeedback = (userWantsFeature: boolean) => {
    setFeedback(userWantsFeature ? "interested" : "not-needed");
    
    // Close the dialog after a brief delay to show the feedback message
    setTimeout(() => {
      onClose();
      // Reset feedback state after closing
      setTimeout(() => setFeedback(null), 500);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{featureName} - Coming Soon</DialogTitle>
          <DialogDescription className="text-center pt-2">
            We're still developing this feature to make your experience better. Your feedback helps us prioritize our roadmap.
          </DialogDescription>
        </DialogHeader>

        {feedback ? (
          <div className="py-6 text-center">
            {feedback === "interested" ? (
              <p className="text-green-600">Thanks! We'll prioritize this feature.</p>
            ) : (
              <p className="text-gray-600">Thanks for your feedback!</p>
            )}
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center">
            <p className="mb-4 text-center">Would you find this feature useful?</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => handleFeedback(false)}>
                I don't really need this
              </Button>
              <Button className="bg-[#f6822d] hover:bg-orange-600" onClick={() => handleFeedback(true)}>
                Please add this
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 