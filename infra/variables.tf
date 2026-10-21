variable "region" {
  type    = string
  default = "eu-west-3"
}

variable "app_name" {
  type    = string
  default = "atelier_tenisu"
}

variable "image_tag" {
  description = "Tag de l'image Docker poussée dans ECR"
  type        = string
  default     = "latest"
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}
