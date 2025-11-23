# Kafka Topics Creation Script for SMS API
# This script creates all necessary Kafka topics for the microservices

$topics = @(
    # Student Service Topics
    "student.createProfile",
    "student.getAll",
    "student.getById",
    "student.update",
    "student.delete",
    "student.getStats",
    "student.deleted",
    
    # Teacher Service Topics
    "teacher.createProfile",
    "teacher.getAll",
    "teacher.getById",
    "teacher.update",
    "teacher.delete",
    "teacher.getStats",
    "teacher.deleted",
    
    # Auth Service Topics
    "user.login",
    "user.refresh",
    "user.logout",
    "user.changePassword",
    "user.created",
    "user.me",
    "user.forgot-password",
    "admin.createProfile",
    "admin.list",
    "admin.get",
    "admin.update",
    "admin.delete",
    "tempPass.created",
    
    # Academics Service Topics
    "school.get",
    "school.update",
    "class.create",
    "class.getAll",
    "class.getById",
    "class.update",
    "class.delete",
    "subject.create",
    "subject.getAll",
    "subject.getById",
    "subject.update",
    "subject.delete",
    "class.assignSubjects",
    "class.getSubjects",
    "class.removeSubject",
    
    # Activity Service Topics
    "activity.log",
    "activity.getAll",
    "activity.getById",
    "activity.getStats",
    
    # Email Service Topics
    "email.send"
)

Write-Host "Creating Kafka topics..." -ForegroundColor Green
Write-Host "Total topics to create: $($topics.Count)" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($topic in $topics) {
    Write-Host "Creating topic: $topic" -ForegroundColor Yellow
    
    $result = docker exec kafka1 kafka-topics.sh `
        --bootstrap-server localhost:9092 `
        --create `
        --topic $topic `
        --partitions 1 `
        --replication-factor 1 `
        --if-not-exists 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Created: $topic" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ✗ Failed: $topic - $result" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Topic Creation Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Cyan

# List all topics to verify
Write-Host "`nListing all topics:" -ForegroundColor Cyan
docker exec kafka1 kafka-topics.sh --bootstrap-server localhost:9092 --list

Write-Host "`nDone! You can now restart your services with 'npm run dev'" -ForegroundColor Green
