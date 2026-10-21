output "app_url" {
  value = aws_apigatewayv2_api.app.api_endpoint
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}
