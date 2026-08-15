terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {

  }
}

resource "azurerm_resource_group" "k8s" {
  name     = "k8s-learning-rg"
  location = "Sweden Central"
}

resource "azurerm_kubernetes_cluster" "k8s" {
  name                = "k8s-learning"
  location            = azurerm_resource_group.k8s.location
  resource_group_name = azurerm_resource_group.k8s.name
  dns_prefix          = "k8-learning"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size = "Standard_D4s_v4"
  }

  identity {
    type = "SystemAssigned"
  }

  sku_tier = "Free"
}
