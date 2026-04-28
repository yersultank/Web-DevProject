import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToxicSettings, ToxicMessage } from '../../../models/user.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent implements OnInit {
  settings: ToxicSettings | null = null;
  newMsgText = '';
  newMsgTrigger: 'tab_leave' | 'late_submit' = 'tab_leave';
  editingId: number | null = null;
  editingText = '';
  saving = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.adminService.getSettings().subscribe({
      next: s => { this.settings = s; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  saveSettings() {
    if (!this.settings) return;
    this.saving = true;
    this.adminService.updateSettings({
      enabled: this.settings.enabled,
      trigger_tab_leave: this.settings.trigger_tab_leave,
      trigger_late_submit: this.settings.trigger_late_submit,
    }).subscribe({ next: () => { this.saving = false; this.cdr.detectChanges(); }, error: () => { this.saving = false; this.cdr.detectChanges(); } });
  }

  addMessage() {
    if (!this.newMsgText.trim()) return;
    this.adminService.addToxicMessage({ trigger: this.newMsgTrigger, text: this.newMsgText }).subscribe(() => {
      this.newMsgText = ''; this.load();
    });
  }

  startEdit(msg: ToxicMessage) { this.editingId = msg.id; this.editingText = msg.text; }

  saveEdit(id: number) {
    this.adminService.updateToxicMessage(id, { text: this.editingText }).subscribe(() => {
      this.editingId = null; this.load();
    });
  }

  deleteMsg(id: number) {
    this.adminService.deleteToxicMessage(id).subscribe(() => this.load());
  }

  tabLeaveMessages() { return this.settings?.messages.filter(m => m.trigger === 'tab_leave') ?? []; }
  lateSubmitMessages() { return this.settings?.messages.filter(m => m.trigger === 'late_submit') ?? []; }
}
