import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressResponsePayload } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);

  public getAddress(): Observable<AddressResponsePayload> {
    const username = 'admin';
    const password = 'password';
    const encoded = btoa(`${username}:${password}`);

    const headers = new HttpHeaders({
      Authorization: `Basic ${encoded}`,
    });

    return this.http.get<AddressResponsePayload>(`http://localhost:3002/address`, { headers });
  }
}
