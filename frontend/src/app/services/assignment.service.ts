import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyAssignment, Submission } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getMyAssignments(): Observable<MyAssignment[]> {
    return this.http.get<MyAssignment[]>(`${this.api}/my-assignments/`);
  }

  getAssignment(id: number): Observable<any> {
    return this.http.get(`${this.api}/assignments/${id}/`);
  }

  submitAssignment(data: FormData | any): Observable<Submission> {
    return this.http.post<Submission>(`${this.api}/submissions/`, data);
  }

  getSubmission(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.api}/submissions/${id}/`);
  }

  reviewSubmission(id: number, score: number, feedback: string): Observable<Submission> {
    return this.http.post<Submission>(`${this.api}/submissions/${id}/review/`, { score, feedback });
  }

  getAdminSubmissions(status?: string): Observable<Submission[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Submission[]>(`${this.api}/admin/submissions/${params}`);
  }
}
