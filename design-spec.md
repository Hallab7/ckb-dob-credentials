{
  "meta": {
    "project": "CredSpore",
    "style": "Ultra-minimal black and white CredSpore interface",
    "design_language": [
      "Editorial minimalism",
      "Luxury monochrome",
      "Swiss-inspired layout",
      "Modern brutal elegance",
      "High whitespace",
      "Sharp typography"
    ],
    "mood": [
      "Confident",
      "Timeless",
      "Technical",
      "Minimal",
      "Sophisticated"
    ]
  },

  "layout": {
    "type": "Full-bleed layout",
    "structure": {
      "background": "Edge-to-edge viewport",
      "container_behavior": "No visible card/container",
      "content_alignment": "Centered grid with generous whitespace",
      "sections": [
        "Navigation",
        "Hero",
        "Metrics strip",
        "Feature grid",
        "Footer"
      ]
    },

    "responsive_breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },

    "responsive_behavior": {
      "2xl": {
        "layout": "Wide cinematic spacing",
        "hero_max_width": "1600px"
      },

      "xl": {
        "layout": "Balanced desktop spacing"
      },

      "lg": {
        "layout": "Two-column hero"
      },

      "md": {
        "layout": "Stacked sections",
        "reduced_spacing": true
      },

      "sm": {
        "layout": "Single-column mobile",
        "navigation": "Collapsed",
        "cta_buttons": "Full width"
      }
    },

    "spacing": {
      "page_padding_x": {
        "desktop": "64px",
        "tablet": "32px",
        "mobile": "20px"
      },

      "section_spacing": {
        "desktop": "140px",
        "tablet": "100px",
        "mobile": "72px"
      }
    }
  },

  "grid_system": {
    "columns": 12,
    "gutter": {
      "desktop": "32px",
      "tablet": "24px",
      "mobile": "16px"
    }
  },

  "typography": {
    "font_style": "Neutral modern grotesk sans-serif",

    "weights": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },

    "hero_heading": {
      "desktop": {
        "size": "112px",
        "line_height": "0.92",
        "tracking": "-0.06em",
        "weight": 600
      },

      "tablet": {
        "size": "72px"
      },

      "mobile": {
        "size": "48px"
      }
    },

    "section_heading": {
      "desktop": {
        "size": "48px",
        "line_height": "1.05"
      },

      "mobile": {
        "size": "32px"
      }
    },

    "body_text": {
      "desktop": {
        "size": "18px",
        "line_height": "1.8"
      },

      "mobile": {
        "size": "16px"
      }
    },

    "caption_text": {
      "size": "13px",
      "tracking": "0.08em",
      "transform": "uppercase"
    }
  },

  "color_system": {
    "primary_palette": {
      "50": "#F5F5F5",
      "100": "#E5E5E5",
      "200": "#D4D4D4",
      "300": "#A3A3A3",
      "400": "#737373",
      "500": "#525252",
      "600": "#404040",
      "700": "#262626",
      "800": "#171717",
      "900": "#0A0A0A"
    },

    "secondary_palette": {
      "50": "#FFFFFF",
      "100": "#FAFAFA",
      "200": "#F4F4F5",
      "300": "#E4E4E7",
      "400": "#D4D4D8",
      "500": "#A1A1AA",
      "600": "#71717A",
      "700": "#52525B",
      "800": "#27272A",
      "900": "#09090B"
    },

    "dark_mode": {
      "background": "#000000",
      "surface": "#0A0A0A",
      "surface_secondary": "#111111",
      "text_primary": "#FFFFFF",
      "text_secondary": "#A1A1AA",
      "border": "rgba(255,255,255,0.08)"
    },

    "light_mode": {
      "background": "#FFFFFF",
      "surface": "#FAFAFA",
      "surface_secondary": "#F5F5F5",
      "text_primary": "#09090B",
      "text_secondary": "#52525B",
      "border": "rgba(0,0,0,0.08)"
    },

    "accent_colors": {
      "pure_white": "#FFFFFF",
      "pure_black": "#000000",
      "soft_gray": "#A1A1AA",
      "border_gray": "#27272A"
    }
  },

  "backgrounds": {
    "dark_mode": {
      "base": "Pure black",
      "texture": "Optional ultra-subtle film grain",
      "effects": [
        "Very soft radial fade",
        "Minimal ambient shadowing"
      ]
    },

    "light_mode": {
      "base": "Pure white",
      "texture": "Flat clean surface",
      "effects": [
        "Soft layered elevation through shadows only"
      ]
    }
  },

  "navigation": {
    "height": "88px",

    "layout": {
      "left": "Wordmark/logo",
      "center": "Primary navigation",
      "right": "Actions"
    },

    "style": {
      "background": "Transparent",
      "border": "None",
      "position": "Floating top spacing"
    },

    "nav_links": {
      "gap": "40px",
      "style": "Minimal text links"
    },

    "actions": {
      "primary_button": {
        "style": "Solid inverted monochrome"
      },

      "secondary_button": {
        "style": "Text-only"
      }
    }
  },

  "hero_section": {
    "layout": {
      "desktop": "Split asymmetrical grid",
      "mobile": "Vertical stack"
    },

    "content": {
      "eyebrow": {
        "style": "Uppercase minimal label",
        "spacing_bottom": "32px"
      },

      "headline": {
        "max_width": "980px",
        "style": "Large editorial typography"
      },

      "description": {
        "max_width": "520px",
        "spacing_top": "32px",
        "opacity": 0.72
      }
    },

    "cta_group": {
      "spacing_top": "48px",
      "gap": "16px",

      "primary_cta": {
        "height": "58px",
        "padding_x": "28px",
        "radius": "999px",
        "background": "#FFFFFF",
        "text_color": "#000000"
      },

      "secondary_cta": {
        "height": "58px",
        "padding_x": "28px",
        "radius": "999px",
        "background": "transparent",
        "border": "1px solid rgba(255,255,255,0.12)"
      }
    }
  },

  "media_direction": {
    "style": "Minimal monochrome visuals",

    "recommended_assets": [
      "Abstract wireframes",
      "Grid systems",
      "Large typography overlays",
      "Black and white financial charts",
      "Monochrome product renders",
      "Thin-line geometric patterns"
    ],

    "avoid": [
      "Colorful gradients",
      "Neon glows",
      "Heavy glassmorphism",
      "Complex textures"
    ]
  },

  "cards_and_sections": {
    "style": "Flat minimal surfaces",

    "radius_scale": {
      "sm": "12px",
      "md": "20px",
      "lg": "32px"
    },

    "surface_rules": {
      "dark_mode": {
        "background": "#0A0A0A",
        "border": "1px solid rgba(255,255,255,0.06)"
      },

      "light_mode": {
        "background": "#FAFAFA",
        "border": "1px solid rgba(0,0,0,0.06)"
      }
    }
  },

  "buttons": {
    "shape": "Rounded pill",

    "primary": {
      "dark_mode": {
        "background": "#FFFFFF",
        "text": "#000000"
      },

      "light_mode": {
        "background": "#000000",
        "text": "#FFFFFF"
      }
    },

    "secondary": {
      "background": "Transparent",
      "border": "Subtle monochrome outline"
    }
  },

  "tables_and_dashboard_elements": {
    "style": "Institutional minimalism",

    "headers": {
      "weight": 500,
      "size": "13px",
      "uppercase": true,
      "tracking": "0.08em"
    },

    "rows": {
      "height": "72px",
      "divider": "1px subtle line"
    },

    "charts": {
      "style": "Thin-line monochrome graphs",
      "fill": "Minimal or transparent"
    }
  },

  "shadows": {
    "dark_mode": {
      "soft": "0 10px 30px rgba(255,255,255,0.02)",
      "medium": "0 20px 60px rgba(255,255,255,0.04)"
    },

    "light_mode": {
      "soft": "0 10px 30px rgba(0,0,0,0.04)",
      "medium": "0 20px 60px rgba(0,0,0,0.08)"
    }
  },

  "motion": {
    "style": "Minimal and restrained",

    "duration": {
      "fast": "120ms",
      "normal": "220ms",
      "slow": "420ms"
    },

    "hover_behavior": [
      "Slight opacity shifts",
      "Soft elevation",
      "Subtle scale increase",
      "Background inversion"
    ],

    "avoid": [
      "Elastic motion",
      "Strong glows",
      "Aggressive transitions"
    ]
  },

  "accessibility": {
    "contrast": "AAA-level preferred",
    "focus_state": "Clear monochrome outline",
    "minimum_touch_target": "44px"
  },

  "implementation_prompt": "```md\nDesign a full-bleed monochrome interface with no visible outer container. The layout should feel premium, editorial, and extremely minimal.\n\nUse only black, white, and grayscale tokens for all UI surfaces, typography, borders, and interactions.\n\nThe interface should rely on:\n- Strong typography hierarchy\n- Spacious whitespace\n- Thin dividers\n- Minimal rounded surfaces\n- Elegant alignment\n- Soft depth through shadows only\n\nAvoid colorful gradients, neon effects, excessive glassmorphism, or decorative visuals.\n\nThe overall experience should feel like a luxury financial operating system:\n- Calm\n- Precise\n- Technical\n- Confident\n- Timeless\n\nUse the primary palette for dominant backgrounds and typography contrast.\nUse the secondary palette for layered surfaces and muted UI elements.\nAccent colors should remain strictly monochrome.\n\nThe UI should scale cleanly from ultra-wide desktop screens to compact mobile layouts while preserving whitespace and readability.\n\nInteractions should feel subtle and refined with restrained hover animations and soft transitions.\n```"
}