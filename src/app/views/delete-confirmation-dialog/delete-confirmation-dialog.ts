import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, of, tap } from 'rxjs';

export interface DialogData {
  id: string;
  name: string;
  email: string;
  deleteFunction: (id: string) => Observable<unknown>;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  imports: [MatButtonModule],
  templateUrl: './delete-confirmation-dialog.html',
  styleUrl: './delete-confirmation-dialog.scss',
})
export class DeleteConfirmationDialog {
  private readonly dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
  public readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);

  public onAccept() {
    this.data
      .deleteFunction(this.data.id)
      .pipe(
        catchError((networkError: HttpErrorResponse) => {
          this.snackBar.open((networkError.error as Error).message, 'Ok');

          return of(undefined);
        }),
        tap((result) => {
          if (result !== undefined) {
            this.dialogRef.close({ success: true });
          }
        })
      )
      .subscribe();
  }

  public onClose(): void {
    this.dialogRef.close({ success: false });
  }
}
