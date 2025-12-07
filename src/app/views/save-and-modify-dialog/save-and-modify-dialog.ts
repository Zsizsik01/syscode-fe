import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, of, tap } from 'rxjs';
import { strictEmailValidator } from '../../validators';

export interface DialogData {
  id?: string;
  name?: string;
  email?: string;
  executableFunction: (name: string, email: string, id?: string) => Observable<unknown>;
  type: 'Create' | 'Update';
}

@Component({
  selector: 'app-save-and-modify-dialog',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './save-and-modify-dialog.html',
  styleUrl: './save-and-modify-dialog.scss',
})
export class SaveAndModifyDialog {
  private readonly dialogRef = inject(MatDialogRef<SaveAndModifyDialog>);
  public readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);

  public formGroup = new FormGroup({
    name: new FormControl(this.data.name ?? '', [Validators.required, Validators.maxLength(200)]),
    email: new FormControl(this.data.email ?? '', [
      Validators.required,
      strictEmailValidator(),
      Validators.maxLength(320),
    ]),
  });

  public getErrorMessage(controlName: string): string | null {
    const control = this.formGroup.get(controlName);

    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['maxlength']) {
      return 'Too long';
    }
    if (control.errors['email']) {
      return 'Invalid email';
    }

    return null;
  }

  public onSubmit(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const { name, email } = this.formGroup.value as { name: string; email: string };

    this.data
      .executableFunction(name, email, this.data.type === 'Update' ? this.data.id : undefined)
      .pipe(
        catchError((networkError: HttpErrorResponse) => {
          this.snackBar.open((networkError.error as Error).message, 'Ok');

          return of(null);
        }),
        tap((result) => {
          if (result !== null) {
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
