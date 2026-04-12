# Video Generation Templates

Prompts for AI video generation: Sora 2, Veo 3.1, Kling 3.0, Runway Gen-4.5, Seedance 2.0, Pika 2.5, Luma Ray 3, etc.

Video prompts are **flat natural language** — no XML tags. Resolution, duration, aspect ratio, and FPS are set via platform parameters, NOT in the prompt text.

---

## Base Structure

A strong video prompt layers these elements:

```
[Style/aesthetic]. [Subject + action]. [Environment details]. [Camera movement]. [Lighting source]. [Audio (if supported)].
```

Keep to 3-6 sentences, 100-150 words. Shorter clips (4-5s) follow instructions more reliably than longer ones.

---

## Text-to-Video

Maximum creative freedom, requires the most detail.

```
{{style_aesthetic}}.
{{subject}} {{action}} in {{environment}}.
{{environment_details}}.
{{camera_movement}}.
{{lighting_source}}.
{{audio_description (if supported)}}.
```

**Example:**
```
Shot on 35mm Kodak film stock, warm amber tones.
A woman in a red coat walks through a rain-soaked Tokyo alley at night.
Neon signs reflect off wet pavement, steam rises from a grate.
Slow dolly tracking shot at waist height.
Lit by flickering neon and distant streetlamps.
Rain pattering on metal awnings, distant traffic hum.
```

---

## Image-to-Video

The **dominant professional workflow in 2026** — validate composition with an image first, then animate. Prompts focus on motion, not appearance (the image handles that).

```
{{motion_description}}.
{{camera_movement}}.
{{atmosphere_changes}}.
{{audio (if supported)}}.
```

**Example:**
```
The subject slowly turns their head to the left, hair catching the wind.
Gentle push-in from medium to close-up.
Fog gradually thickens in the background.
```

---

## Common Camera Keywords

These work across all major models:

| Movement | Keywords |
|----------|---------|
| **Horizontal** | pan left/right, tracking shot, dolly |
| **Vertical** | tilt up/down, crane shot, boom |
| **Depth** | push-in, pull-out, zoom in/out, crash zoom |
| **Handheld** | handheld, shoulder-cam, shaky cam |
| **Smooth** | steadicam, gimbal, glide |
| **Aerial** | drone shot, bird's eye, aerial establishing |
| **Specialty** | whip-pan, Dutch angle, first-person POV, time-lapse |

---

## Platform Notes (as of March 2026)

| Platform | Key difference |
|----------|---------------|
| **Sora 2** | Best cinematic quality; native audio (dialogue + SFX); up to 25s (Pro); cinematography terms work well |
| **Veo 3.1** | Best prompt-following; native spatial audio; true 4K (3840x2160); name physical light sources ("neon sign") not abstract ones ("dramatic lighting") |
| **Kling 3.0** | Best faces/hands; native 4K 60fps HDR; multi-shot sequencing (up to 6 cuts per generation); multi-character audio with voice reference |
| **Runway Gen-4.5** | #1 on Artificial Analysis (1,247 Elo); Motion Brush 3.0 for painted motion paths; best physical coherence (weight, inertia, collisions) |
| **Seedance 2.0** | Multi-modal input (up to 9 images + 3 videos + 3 audio); native audio-video joint generation; 2K resolution; multi-shot storytelling; 8+ language lip-sync |
| **Pika 2.5** | Creative effects (Pikaffects physics simulations, Pikaswaps); integrated sound generation; timeline-based editor |
| **Luma Ray 3** | First reasoning video model (self-evaluates); native HDR (16-bit EXR); 1080p native, 4K via neural upscaling; Ray3.14 update: 4x faster |

---

## Tips

- **Image-to-video first** — validate composition cheaply with an image model, then animate. Going straight to text-to-video wastes credits on uncontrolled compositions
- **Limit motion elements** — 2-3 camera/subject movements max. "Camera spins while zooming while subject backflips" produces chaos
- **Cinematic verbs over generic ones** — "dolly push" beats "camera moves forward"; "whip-pan" beats "quick turn"
- **Name light sources** — "lit by a cracked doorway and overcast sky" beats "dramatic lighting"
- **Don't put parameters in the prompt** — resolution, duration, FPS, aspect ratio are platform settings, not prompt text
- **Style first** — front-load the visual aesthetic: "1970s film grain," "IMAX-scale," "16mm black-and-white"
- **Audio separately** — for models with native audio (Sora 2, Veo 3.1, Kling 3.0, Seedance 2.0), describe sounds in dedicated sentences. Use quotes for dialogue
