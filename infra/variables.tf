variable "region" {
  type    = string
  default = "eu-west-3"
}

variable "app_name" {
  type    = string
  default = "tenisu"
}

variable "image_tag" {
  description = "Tag de l'image Docker poussée dans ECR"
  type        = string
  default     = "latest"
}

variable "memory" {
  type    = number
  default = 512
}
