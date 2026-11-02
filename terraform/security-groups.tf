# ============================================================
# Security Group Configuration for ParkFlow EC2 Host
# ============================================================

resource "aws_security_group" "ec2_sg" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Controls inbound and outbound traffic for ParkFlow EC2 Docker host"
  vpc_id      = aws_vpc.main.id

  # ------------------------------------------------------------
  # PUBLIC WEB INGRESS (Accessible to End Users)
  # ------------------------------------------------------------

  # 1. HTTP Web Access (Port 80) - Nginx reverse proxy
  ingress {
    description = "Public HTTP web traffic for Nginx frontend and API gateway"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 2. HTTPS Web Access (Port 443) - Secure web traffic
  ingress {
    description = "Public HTTPS secure web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ------------------------------------------------------------
  # RESTRICTED ADMIN & MONITORING INGRESS (Restricted to Authorized IP)
  # ------------------------------------------------------------

  # 3. SSH Remote Management (Port 22)
  ingress {
    description = "SSH terminal access restricted to authorized administrator IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # 4. Grafana Monitoring Dashboard (Port 3001) - Restricted
  ingress {
    description = "Grafana dashboard restricted to authorized administrator IP"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # 5. Direct Frontend Development Port (Port 3000) - Restricted
  ingress {
    description = "Direct React container port for admin debugging (public uses port 80)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # 6. Direct Backend REST API Port (Port 8081) - Restricted
  ingress {
    description = "Direct Spring Boot container port for admin debugging (public uses port 80/api)"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # NOTE: PostgreSQL port 5432 is strictly NOT exposed.
  # PostgreSQL communicates exclusively over Docker's internal network (parkflow-net).

  # ------------------------------------------------------------
  # EGRESS RULES (Outbound)
  # ------------------------------------------------------------
  egress {
    description = "Allow all outbound traffic for OS updates, package managers, and Docker image pulls"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-sg"
  }
}
