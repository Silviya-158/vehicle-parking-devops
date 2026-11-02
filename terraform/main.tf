# ============================================================
# Main Infrastructure Definition: VPC, Subnet, Routing, and EC2
# ============================================================

# 1. AWS VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# 2. Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# 3. Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-${var.environment}-public-subnet"
    Type = "Public"
  }
}

# 4. Route Table & Internet Route
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# 5. Route Table Association
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# 6. Latest Amazon Linux 2023 AMI (optional dynamic lookup if ami_id is not specified)
data "aws_ami" "amazon_linux_2023" {
  count       = var.ami_id == "" ? 1 : 0
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# 7. Optional SSH Key Pair (created only if ssh_public_key is provided)
resource "aws_key_pair" "generated" {
  count      = var.ssh_public_key != "" ? 1 : 0
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = var.ssh_public_key

  tags = {
    Name = "${var.project_name}-${var.environment}-key"
  }
}

# 8. Single EC2 Instance for Docker & ParkFlow Stack
resource "aws_instance" "app_server" {
  ami                  = var.ami_id != "" ? var.ami_id : data.aws_ami.amazon_linux_2023[0].id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public.id
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  associate_public_ip_address = true
  monitoring                  = var.enable_detailed_monitoring

  key_name = var.ssh_key_name != "" ? var.ssh_key_name : (
    var.ssh_public_key != "" ? aws_key_pair.generated[0].key_name : null
  )

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true

    tags = {
      Name = "${var.project_name}-${var.environment}-root-ebs"
    }
  }

  # Automated user_data script: Installs Docker, Docker Compose plugin, and AWS CloudWatch Agent
  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Update system packages
              dnf update -y

              # Install Docker and git
              dnf install -y docker git amazon-cloudwatch-agent

              # Enable and start Docker daemon
              systemctl enable --now docker
              usermod -aG docker ec2-user

              # Install Docker Compose Plugin (v2)
              DOCKER_CONFIG=/usr/local/lib/docker
              mkdir -p $DOCKER_CONFIG/cli-plugins
              curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
              chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
              ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose || true

              # Create application directory
              mkdir -p /opt/parkflow
              chown -R ec2-user:ec2-user /opt/parkflow

              echo "ParkFlow EC2 Initialization Complete!" > /var/log/parkflow-init.log
              EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-app-server"
    Role = "ApplicationHost"
  }
}
