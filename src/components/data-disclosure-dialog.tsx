
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface DataDisclosureDialogProps {
    onAllow: () => void;
    onDeny: () => void;
}

export function DataDisclosureDialog({ onAllow, onDeny }: DataDisclosureDialogProps) {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Data Access & Usage</AlertDialogTitle>
          <AlertDialogDescription>
            Our "Reservation Assistance" feature needs to access your contact list to help you easily invite friends to your reservations. This app collects and stores your contact list information to enable this feature.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onDeny}>Deny</Button>
          <AlertDialogAction onClick={onAllow}>Allow</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
