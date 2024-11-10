resource "google_compute_network" "vpc_network" {
  name                    = "rtuk-vpc"
  auto_create_subnetworks = true
}

resource "google_vpc_access_connector" "vpc_connector" {
  name          = "rtuk-vpc-connector"
  region        = var.region
  network       = google_compute_network.vpc_network.name
  ip_cidr_range = "10.8.0.0/28"  # A small range for the VPC Connector

  min_instances = 2
  max_instances = 3

  depends_on = [
    google_project_service.vpcaccess,
    google_compute_network.vpc_network
  ]

}

resource "google_compute_global_address" "private_ip_range" {
  name          = "sql-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id

  depends_on = [
    google_project_service.service_networking,
    google_compute_global_address.private_ip_range
  ]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

resource "google_compute_router" "nat_router" {
  name    = "rtuk-nat-router"
  network = google_compute_network.vpc_network.name
  region  = var.region
}

resource "google_compute_router_nat" "nat" {
  name                               = "nat-config"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  depends_on = [
    google_project_service.compute,
    google_compute_router.nat_router
  ]
}
