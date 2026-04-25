from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'Profile of {self.user.username}'
    
class Course(models.Model):
    name = models.CharField(max_length=255, default='JavaScript Course')

    def __str__(self):
        return self.name


class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ('order',)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ('order',)

    def __str__(self):
        return self.title
    
class Assignment(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='assignment', null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()

    def __str__(self):
        return self.title


class Submission(models.Model):
    STATUS = [('pending', 'Pending'), ('reviewed', 'Reviewed')]
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    text_answer = models.TextField(blank=True)
    code_answer = models.TextField(blank=True)
    file_answer = models.FileField(upload_to='submissions/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    status = models.CharField(choices=STATUS, default='pending', max_length=20)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.student.username} → {self.assignment.title}'
    
class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField(blank=True)
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ('created_at',)

    def __str__(self):
        return f'{self.sender.username} → {self.recipient.username}'


class SubmissionComment(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='comments')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)

    def __str__(self):
        return f'Comment on {self.submission}'


class Announcement(models.Model):
    text = models.TextField()
    photo = models.ImageField(upload_to='announcements/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.text[:50]


class AnnouncementRead(models.Model):
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('announcement', 'user')


class Notification(models.Model):
    TYPE = [
        ('chat', 'Chat'),
        ('toxic', 'Toxic'),
        ('announcement', 'Announcement'),
        ('assignment', 'Assignment'),
        ('lesson', 'Lesson'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(choices=TYPE, max_length=20)
    text = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.user.username}: {self.type}'

class ToxicSettings(models.Model):
    """Singleton — only one row ever exists"""
    enabled = models.BooleanField(default=True)
    trigger_tab_leave = models.BooleanField(default=True)
    trigger_late_submit = models.BooleanField(default=True)

    def __str__(self):
        return 'Toxic Settings'


class ToxicMessage(models.Model):
    TRIGGER = [('tab_leave', 'Tab Leave'), ('late_submit', 'Late Submit')]
    trigger = models.CharField(choices=TRIGGER, max_length=20)
    text = models.TextField()

    def __str__(self):
        return f'{self.trigger}: {self.text[:40]}'
