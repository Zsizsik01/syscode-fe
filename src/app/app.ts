import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AddressService, ProfileService } from './services';
import { catchError, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AddressResponsePayload, StudentResponsePayload } from './interfaces';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SaveAndModifyDialog } from './views/save-and-modify-dialog/save-and-modify-dialog';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmationDialog } from './views/delete-confirmation-dialog/delete-confirmation-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, MatTableModule, MatDialogModule, MatIconModule],
  providers: [ProfileService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly addressService = inject(AddressService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  public dataSource: StudentResponsePayload[] = [];
  public displayedColumns: string[] = ['name', 'email', 'buttons'];
  public addressResult!: AddressResponsePayload;

  ngOnInit(): void {
    this.listStudents();

    this.addressService
      .getAddress()
      .pipe(
        catchError((networkError: HttpErrorResponse) => {
          this.snackBar.open((networkError.error as Error).message, 'Ok');

          return of(null);
        }),
        tap((result) => {
          if (result !== null) {
            this.addressResult = result;
          }
        })
      )
      .subscribe();
  }

  public listStudents(): void {
    this.profileService
      .listStudents()
      .pipe(
        catchError((networkError: HttpErrorResponse) => {
          this.snackBar.open((networkError.error as Error).message, 'Ok');

          return of([] as StudentResponsePayload[]);
        }),
        tap((result) => {
          this.dataSource = result;
        })
      )
      .subscribe();
  }

  public openSaveAndModifyDialog(
    type: 'Create' | 'Update',
    entity?: {
      id?: string;
      name?: string;
      email?: string;
    }
  ): void {
    this.dialog
      .open(SaveAndModifyDialog, {
        data: {
          executableFunction:
            type === 'Create'
              ? (name: string, email: string) => this.profileService.createStudent(name, email)
              : (name: string, email: string, id?: string) =>
                  this.profileService.updateStudent(id!, name, email),
          type,
          id: entity?.id,
          name: entity?.name,
          email: entity?.email,
        },
      })
      .afterClosed()
      .pipe(
        tap((result?: { success: boolean }) => {
          if (result?.success) {
            this.snackBar.open(
              `User ${type === 'Create' ? 'created' : 'modified'} successfully!`,
              'Ok'
            );

            this.listStudents();
          }
        })
      )
      .subscribe();
  }

  public openDeleteConfirmationDialog(entity: StudentResponsePayload): void {
    this.dialog
      .open(DeleteConfirmationDialog, {
        data: {
          id: entity.id,
          name: entity.name,
          email: entity.email,
          deleteFunction: (id: string) => this.profileService.deleteStudent(id),
        },
        minWidth: '500px',
      })
      .afterClosed()
      .pipe(
        tap((result?: { success: boolean }) => {
          if (result?.success) {
            this.snackBar.open(`User deleted successfully!`, 'Ok');

            this.listStudents();
          }
        })
      )
      .subscribe();
  }
}
