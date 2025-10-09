# Styling Oxide Components

To ensure backward compatibility with existing skins, all oxide-components should be styled inside **Oxide** library. 

Currently, we are migrating from LESS to CSS. 
See the **three migration stages** of Oxide components:

| Stage Name | Description | Key Characteristics |
| --- | --- | --- |
| **Legacy** | The current version of the component, fully styled in LESS. | No modern CSS features, fully dependent on LESS variables |
| **Transitional** | The transitional state where modern CSS is introduced alongside existing LESS styles. | CSS Custom Properties introduced behind a feature flag, LESS variables still present, CSS uses fallbacks to LESS, backward compatible with old skins |
| **Modern CSS** | The final, fully modernized version of the component. | Fully styled with modern CSS, LESS completely removed, no dependency on LESS variables, breaking change, old skins are no longer supported |

All new components should be written in the **Transitional** stage to minimize adding to the tech debt. To learn more read `Converting a Legacy Component to the Transitional Stage` documentation.