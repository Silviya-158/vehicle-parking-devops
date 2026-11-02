output "ec2_public_ip" {
  description = "Public IP address of the EC2 Docker host"
  value       = aws_eip.host_ip.public_ip
}

output "rds_endpoint" {
  description = "Connection endpoint for PostgreSQL RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_database_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}

output "app_url" {
  description = "Direct Application URL"
  value       = "http://${aws_eip.host_ip.public_ip}:3000"
}

output "api_url" {
  description = "Direct REST API URL"
  value       = "http://${aws_eip.host_ip.public_ip}:8080/api"
}
