import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryDataResponse {
  success: boolean;
  data: {
    categoryObj: Record<string, string> | null;
    subCategoryObj: Record<string, string[]> | null;
    valueObj: Record<string, any[]> | null;
  };
}

export interface SaveResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDataResponse> {
    return this.http.get<CategoryDataResponse>(this.apiUrl);
  }

  saveCategories(payload: { categoryObj: any; subCategoryObj: any; valueObj: any }): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(`${this.apiUrl}/save`, payload);
  }
}
