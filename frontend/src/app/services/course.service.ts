import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Topic, Lesson } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getCourse(): Observable<Course> {
    return this.http.get<Course>(`${this.api}/course/`);
  }

  createTopic(data: { title: string; order?: number }): Observable<Topic> {
    return this.http.post<Topic>(`${this.api}/topics/`, data);
  }

  updateTopic(id: number, data: Partial<Topic>): Observable<Topic> {
    return this.http.patch<Topic>(`${this.api}/topics/${id}/`, data);
  }

  deleteTopic(id: number, confirm = false): Observable<any> {
    const params = confirm ? '?confirm=true' : '';
    return this.http.delete(`${this.api}/topics/${id}/${params}`);
  }

  createLesson(data: { topic: number; title: string; content: string; order?: number }): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.api}/lessons/`, data);
  }

  updateLesson(id: number, data: Partial<Lesson>): Observable<Lesson> {
    return this.http.patch<Lesson>(`${this.api}/lessons/${id}/`, data);
  }

  deleteLesson(id: number, confirm = false): Observable<any> {
    const params = confirm ? '?confirm=true' : '';
    return this.http.delete(`${this.api}/lessons/${id}/${params}`);
  }

  createAssignment(data: any): Observable<any> {
    return this.http.post(`${this.api}/assignments/`, data);
  }

  updateAssignment(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.api}/assignments/${id}/`, data);
  }
}
