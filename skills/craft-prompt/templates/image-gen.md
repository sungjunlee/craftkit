# Image Generation Templates

Prompts for image generation: Imagen 4 (via Gemini), GPT Image 1.5, Midjourney, Stable Diffusion, etc.

---

## Base Structure

```
{{subject}} in {{setting}}.
{{action_or_pose}}.

Style: {{art_style}}
Mood: {{mood}}
Lighting: {{lighting}}
Composition: {{layout}}
Color palette: {{colors}}

Negative: {{what_to_avoid}}
```

Image gen prompts are **flat text** — no XML tags, no markdown headers. Front-load the most important details (first 10 words matter most in diffusion models).

---

## Photo

```
A {{subject}} in {{setting}}, {{action}}.

Style: photorealistic, high resolution
Camera: {{wide angle / close-up / portrait / aerial}}
Lighting: {{natural / studio / dramatic / soft}}

Negative: cartoon, illustration, blurry, watermark
```

## Illustration

```
{{subject}}, {{scene}}.

Style: {{flat / watercolor / oil painting / vector / pixel art}}
Colors: {{palette}}
Detail: {{minimal / moderate / detailed}}

Negative: photorealistic, 3D render, text
```

## Icon / Logo

```
A {{symbol}} representing {{concept}}.

Style: {{flat / gradient / line art}}
Colors: {{primary}} on {{background}}
Simple. No text. No fine detail.

Negative: realistic, photograph, complex background
```

---

## Platform Notes (as of March 2026)

| Platform | Key difference |
|----------|---------------|
| **GPT Image 1.5** (replaced DALL-E) | Natural language; #1 on LM Arena (1277 Elo); 4x faster than v1; strong text rendering |
| **Imagen 4** (via Gemini) | Fast ($0.02) / Standard ($0.04) / Ultra ($0.06); best photorealism + people/faces; Ultra at native 2048x2048 |
| **Midjourney V7** | Default model; 95%+ text accuracy (1-3 words in quotes); `--ar`, `--oref`, `--ow`, `--stylize` params |
| **Flux 2 Pro** | 32B params; top-tier photorealism; up to 4MP output; processes up to 10 reference images |
| **Stable Diffusion 3.5** | Weight syntax `(keyword:1.5)`; LoRA/model-specific keywords; open-source, full customization |
| **Ideogram 3.0** | Best text rendering (~90% accuracy); strong for logos, posters, typography-heavy work |

## Tips

- **Be concrete** — "a golden retriever sitting on a red couch" beats "a dog on furniture"
- **Negative prompts** — essential for avoiding common artifacts (blurry, extra fingers, watermarks)
- **Style keywords** — "oil painting", "35mm film", "Studio Ghibli style" have strong effects
- **Aspect ratio** — mention if important: "landscape 16:9", "square 1:1", "portrait 9:16"
