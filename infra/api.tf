# API Gateway (HTTP API) -> VPC Link -> Cloud Map -> tâche Fargate.
# Pas d'ALB : l'URL publique est stable, en HTTPS, et la tâche n'est plus exposée directement.

resource "aws_service_discovery_private_dns_namespace" "app" {
  name = "${var.app_name}.local"
  vpc  = data.aws_vpc.default.id
}

resource "aws_service_discovery_service" "app" {
  name = var.app_name

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.app.id
    routing_policy = "MULTIVALUE"

    dns_records {
      type = "A"
      ttl  = 10
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_security_group" "vpc_link" {
  name_prefix = "${var.app_name}-vpclink-"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_vpc_link" "app" {
  name               = var.app_name
  subnet_ids         = data.aws_subnets.default.ids
  security_group_ids = [aws_security_group.vpc_link.id]
}

resource "aws_apigatewayv2_api" "app" {
  name          = var.app_name
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "app" {
  api_id             = aws_apigatewayv2_api.app.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = aws_service_discovery_service.app.arn
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.app.id
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.app.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.app.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.app.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 50
    throttling_burst_limit = 100
  }
}
