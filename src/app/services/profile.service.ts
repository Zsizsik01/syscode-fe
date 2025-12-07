import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentResponsePayload } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  public listStudents(): Observable<StudentResponsePayload[]> {
    return this.http.get<StudentResponsePayload[]>(`http://localhost:3000/students`);
  }

  public createStudent(name: string, email: string): Observable<StudentResponsePayload> {
    return this.http.post<StudentResponsePayload>(`http://localhost:3000/students`, {
      name,
      email,
    });
  }

  public updateStudent(
    id: string,
    name: string,
    email: string
  ): Observable<StudentResponsePayload> {
    return this.http.put<StudentResponsePayload>(`http://localhost:3000/students/${id}`, {
      name,
      email,
    });
  }

  public deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/students/${id}`);
  }
}
