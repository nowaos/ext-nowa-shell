// interfaces/animation.js
import GLib from 'gi://GLib'

/**
 * Animate a St.Icon by switching icon names sequentially.
 *
 * @param {St.Icon} iconActor - The icon actor to animate
 * @param {string} template - Icon name template with {step} placeholder
 * @param {string} finalName - Icon name to set at the end
 * @param {Object} opts - Animation options
 * @param {number[]} [opts.steps=[10,20,30,40,50,60,70,80,90]] - List of steps
 * @param {number} [opts.interval=120] - Interval in ms between frames
 */
export function animate (iconActor, template, finalName, opts = {}) {
  const {
    steps = [10, 20, 30, 40, 50, 60, 70, 80, 90],
    interval = 24
  } = opts

  if (!iconActor) {
    throw new Error('animate: iconActor is invalid')
  }

  let i = 0
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
    if (i < steps.length) {
      const step = steps[i]
      const iconName = template.replace(/\{step\}/g, step)

      iconActor.set_icon_name(iconName)
      i++

      return GLib.SOURCE_CONTINUE
    } else {
      iconActor.set_icon_name(finalName)

      return GLib.SOURCE_REMOVE
    }
  })
}

export const Animation = { animate }
