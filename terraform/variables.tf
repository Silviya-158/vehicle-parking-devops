# ============================================================
# Terraform Variables for ParkFlow Infrastructure
# Target Region: Singapore (ap-southeast-1)
# ============================================================

variable "aws_region" {
  description = "AWS deployment region (Singapore)"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name identifier used for tagging and resource naming"
  type        = string
  default     = "parkflow"
}

variable "environment" {
  description = "Environment identifier (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the ParkFlow VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet hosting the EC2 instance"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Availability zone in Singapore for public subnet"
  type        = string
  default     = "ap-southeast-1a"
}

variable "instance_type" {
  description = "Cost-conscious EC2 instance type (t3.small provides 2 vCPU, 2GB RAM; t3.medium provides 4GB RAM)"
  type        = string
  default     = "t3.small"
}

variable "ami_id" {
  description = "Specific Amazon Linux 2023 AMI ID in ap-southeast-1. Set explicitly to bypass ec2:DescribeImages if restricted by AWS Organization SCP."
  type        = string
  default     = "ami-0b44053e20e335ab8"
}

variable "root_volume_size" {
  description = "Root EBS storage size in GB (gp3 volume type, within AWS free-tier limit of 30 GB)"
  type        = number
  default     = 20
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access (port 22). Strictly restrict to your IP address (e.g., '103.185.85.34/32')"
  type        = string
  default     = "103.185.85.34/32"
}

variable "ssh_key_name" {
  description = "Name of an existing AWS Key Pair in ap-southeast-1 (optional if using ssh_public_key)"
  type        = string
  default     = ""
}

variable "ssh_public_key" {
  description = "Public SSH key content if you want Terraform to provision an aws_key_pair (optional)"
  type        = string
  default     = ""
}

variable "enable_detailed_monitoring" {
  description = "Enable 1-minute detailed CloudWatch monitoring for EC2 (false keeps basic 5-minute free monitoring)"
  type        = bool
  default     = false
}
