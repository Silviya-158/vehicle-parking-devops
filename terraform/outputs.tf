# ============================================================
# Terraform Outputs for ParkFlow Infrastructure
# ============================================================

output "vpc_id" {
  description = "ID of the ParkFlow VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.gw.id
}

output "security_group_id" {
  description = "ID of the EC2 Security Group"
  value       = aws_security_group.ec2_sg.id
}

output "ec2_instance_id" {
  description = "ID of the EC2 Application Server"
  value       = aws_instance.app_server.id
}

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "ec2_iam_role_name" {
  description = "Name of the IAM role attached to the EC2 instance"
  value       = aws_iam_role.ec2_role.name
}

output "ec2_iam_role_arn" {
  description = "ARN of the IAM role attached to the EC2 instance"
  value       = aws_iam_role.ec2_role.arn
}

output "ssh_command" {
  description = "Command to SSH into the EC2 instance"
  value       = "ssh -i <path-to-your-key.pem> ec2-user@${aws_instance.app_server.public_ip}"
}

output "frontend_url" {
  description = "Direct React Frontend Application URL"
  value       = "http://${aws_instance.app_server.public_ip}:3000"
}

output "web_http_url" {
  description = "Standard Web HTTP URL (Nginx reverse proxy on port 80)"
  value       = "http://${aws_instance.app_server.public_ip}"
}

output "backend_api_url" {
  description = "Direct Backend REST API URL"
  value       = "http://${aws_instance.app_server.public_ip}:8081/api"
}

output "grafana_url" {
  description = "Grafana Dashboard Monitoring URL"
  value       = "http://${aws_instance.app_server.public_ip}:3001"
}
