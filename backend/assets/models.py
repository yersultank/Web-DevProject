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