output "postgresql_instance_connection_name" {
  value = google_sql_database_instance.db_instance.connection_name
}

output "postgresql_instance_public_ip" {
  value = google_sql_database_instance.db_instance.public_ip_address
}
output "nameservers" {
  description = "Nameservers for the domain. Point your domain to these."
  value       = google_dns_managed_zone.domain_zone.name_servers
}
