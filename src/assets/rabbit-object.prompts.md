# Rabbit object separation

Created with the built-in image_gen tool from the user-provided night-camp.png.

## Transparent rabbit sprite

Use case: background-extraction. Edit target: the provided night-camp image.
Extract ONLY the small seated rabbit holding a pale sage-green mug in the lower-left camp clearing (its original approximate bounds are x=392..565, y=584..794 in the 1536x1024 source). Create a separate transparent PNG sprite, tightly framed with a small transparent margin.
Preserve the exact rabbit's identity, pose, proportions, silhouette, pixel-art style, warm colors, straw explorer hat with little green leaves, asymmetric pink-lined ears, cream-white fur, dark brown outline, tiny blush cheeks, brown backpack, both paws holding its mug, and small seated feet. Keep the seated CUP-HOLDING pose: this must be the rabbit from this exact image, not a new standing rabbit.
Remove all forest, grass, shadows, the wooden log, campfire, terrain, and all other background elements. Do NOT include the wooden seat/log. The cup and backpack are parts of the sprite and must stay.
Maintain clean crisp square pixel edges with no new details, no text, no watermark, no added objects. Use an actual transparent alpha background, not a checkerboard image or solid color. Center the entire rabbit including ears and feet in the output with a small transparent margin, no cropped body parts. If enlarged, use crisp integer pixel scaling rather than smoothing.

## Background with rabbit removed

Use case: precise-object-edit. Edit target: the provided 1536x1024 night-camp image.
Remove ONLY the small seated rabbit and its mug/backpack/hat/ears at lower left, approximately x=392..565 and y=584..794 in the source image. Reconstruct the forest pixels behind its ears and hat and the top surface of the log where its seated body was. KEEP the wooden log/seat intact: after editing there should be an empty log at exactly the same position.
Everything else must remain visually unchanged and in exactly the same place: the entire forest, trees, starry night sky, moon, left signpost, flowers, foreground rocks, tent, ground, fire ring, flames, sparks, colors, brightness, pixel-art resolution, camera, and framing. This is a localized removal, not a new illustration. Do not shift, redraw or redesign the rest of the scene. Preserve the full original 3:2 canvas composition and dimensions 1536x1024.
The cleared log will receive a separate rabbit sprite later. Do not add another rabbit or any animal. No text, border, watermark. Keep original crisp pixel shapes and matching local texture.

