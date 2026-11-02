variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment identifier (e.g., dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "parkflow"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "EC2 instance type for Docker hosting"
  type        = string
  default     = "t3.medium"
}

variable "db_instance_class" {
  description = "RDS instance class for PostgreSQL"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "PostgreSQL Database name"
  type        = string
  default     = "parking_db"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "parking_admin"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "Public SSH key for EC2 key pair"
  type        = string
  default     = ""
}
