import './tailwind.css'
import './style.scss'

function initHeroAnimation() {
  const hero = document.querySelector('.rws-hero')
  if (!hero) return

  const vectorWrapper = hero.querySelector('.rws-hero-vector')
  const svg = hero.querySelector('.rws-hero-svg')
  const path = hero.querySelector('.rws-hero-path')
  const dot = hero.querySelector('.rws-hero-dot')
  const dotRect = hero.querySelector('.rws-hero-dot-rect')
  const dotCircle = hero.querySelector('.rws-hero-dot-circle')
  const filter = hero.querySelector('#filter0_d_36_6')
  const gradient = hero.querySelector('#paint0_linear_36_6')
  const logo = hero.querySelector('.rws-hero-logo')

  if (!vectorWrapper || !svg || !path || !dot || !logo) return

  const animState = { progress: 0, completed: false }

  function updatePathDash() {
    let totalLength = 0
    try {
      totalLength = path.getTotalLength()
    } catch (e) {
      totalLength = 0
    }
    if (totalLength <= 0) return

    if (animState.completed) {
      path.style.strokeDasharray = 'none'
      path.style.strokeDashoffset = '0'
      const endPt = path.getPointAtLength(totalLength)
      dot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
      return
    }

    const currentDist = animState.progress * totalLength
    const pt = path.getPointAtLength(currentDist)
    dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
    path.style.strokeDasharray = `${totalLength}`
    path.style.strokeDashoffset = `${(totalLength * (1 - animState.progress)).toFixed(2)}`
  }

  function updateVectorGeometry() {
    const logoLeft = logo.offsetLeft
    const logoTop = logo.offsetTop
    const vectorLeft = vectorWrapper.offsetLeft

    // Align the green dot (y = 67.11..95.89, cy = 81.11) with the top-left corner of the logo
    vectorWrapper.style.top = `${logoTop - 67.11}px`

    const endX = Math.max(30, logoLeft - vectorLeft)
    const svgWidth = Math.ceil(endX + 25)

    // Preserve original Bezier proportions (at endX = 720: cp1X = 288.182, cp2Y = 238.816)
    const cp1X = +(endX * (288.182 / 720)).toFixed(3)
    const dipRatio = Math.min(1, Math.max(0.35, endX / 720))
    const cp2Y = +(81.443 + (238.816 - 81.443) * dipRatio).toFixed(3)

    const d = `M0 2.5C${cp1X} 2.50006 ${endX} ${cp2Y} ${endX} 81.443`

    svg.setAttribute('width', `${svgWidth}`)
    svg.setAttribute('viewBox', `0 0 ${svgWidth} 138`)
    path.setAttribute('d', d)

    if (gradient) gradient.setAttribute('x2', endX.toFixed(3))

    updatePathDash()
  }

  function startAnimation() {
    updateVectorGeometry()

    if (window.gsap) {
      const gsap = window.gsap

      const startPt = path.getPointAtLength(0)
      dot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)

      gsap.set(vectorWrapper, { opacity: 1 })
      gsap.set(dot, {
        opacity: 0,
        scale: 0,
        transformOrigin: 'center center'
      })
      gsap.set(logo, {
        opacity: 0,
        scale: 0.94,
        y: 12
      })

      const tl = gsap.timeline()

      // 1. Green point pops in at the start of the vector
      tl.to(dot, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'back.out(1.8)'
      })
      // 2. Green point travels along the curve and uncovers the road behind itself
      .to(animState, {
        progress: 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: updatePathDash,
        onComplete: () => {
          animState.completed = true
          updatePathDash()
        }
      })
      // 3. When the dot reaches the top-left corner of the logo, the logo reveals
      .to(
        logo,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        },
        '+=0.05'
      )
    } else {
      animState.progress = 1
      animState.completed = true
      updatePathDash()
      vectorWrapper.style.opacity = '1'
      logo.style.opacity = '1'
    }
  }

  if (logo.complete && logo.naturalWidth > 0) {
    startAnimation()
  } else {
    logo.addEventListener('load', startAnimation, { once: true })
    logo.addEventListener('error', startAnimation, { once: true })
  }

  window.addEventListener('resize', updateVectorGeometry)
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(updateVectorGeometry)
    ro.observe(hero)
    ro.observe(logo)
  }
}

function initGoalAnimation() {
  const goalSection = document.querySelector('.rws-goal')
  if (!goalSection) return

  const cards = goalSection.querySelectorAll('.rws-goal-card')
  const vectorWrapper = goalSection.querySelector('.rws-goal-vector')
  const path = goalSection.querySelector('.rws-goal-path')
  const dot = goalSection.querySelector('.rws-goal-dot')

  if (!cards.length || !vectorWrapper || !path || !dot) return

  const gsap = window.gsap
  if (!gsap) return

  let mm = gsap.matchMedia()

  // Animate only for screens >= lg (1024px)
  mm.add('(min-width: 1024px)', () => {
    let totalLength = 0
    try {
      totalLength = path.getTotalLength()
    } catch (e) {
      totalLength = 0
    }
    if (totalLength <= 0) return

    const startPt = path.getPointAtLength(0)

    // Initial state
    gsap.set(cards, {
      opacity: 0,
      y: 35,
      scale: 0.95
    })
    gsap.set(vectorWrapper, { opacity: 1 })
    gsap.set(path, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength
    })
    dot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
    gsap.set(dot, {
      opacity: 0,
      scale: 0,
      transformOrigin: 'center center'
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: goalSection,
        start: 'top 75%',
        once: true
      }
    })

    // 1. Staggered entrance of cards
    tl.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out'
    })
    // 2. Dot appears at start of path
    .to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.8)'
    }, '-=0.1')

    // 3. Dot moves along the curve, uncovering the line behind itself
    const progressObj = { value: 0 }
    tl.to(progressObj, {
      value: 1,
      duration: 2.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        const dist = progressObj.value * totalLength
        const pt = path.getPointAtLength(dist)
        dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
        path.style.strokeDashoffset = `${(totalLength - dist).toFixed(2)}`
      },
      onComplete: () => {
        const endPt = path.getPointAtLength(totalLength)
        dot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' })
      }
    })

    return () => {
      // Revert styles on screen resize below 1024px
      gsap.set([cards, vectorWrapper, path, dot], { clearProps: 'all' })
    }
  })

  // For screens < 1024px, ensure cards are completely reset and visible without animations
  mm.add('(max-width: 1023px)', () => {
    gsap.set(cards, { clearProps: 'all', opacity: 1, y: 0, scale: 1 })
    gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
  })
}

function initProblemsAnimation() {
  const problemsSection = document.querySelector('.rws-problems')
  if (!problemsSection) return

  const vectorWrapper = problemsSection.querySelector('.rws-problems-vector')
  const path = problemsSection.querySelector('.rws-problems-path')
  const dot = problemsSection.querySelector('.rws-problems-dot')

  if (!vectorWrapper || !path || !dot) return

  const gsap = window.gsap
  if (!gsap) return

  let mm = gsap.matchMedia()

  // Animate drawing only for screens >= lg (1024px)
  mm.add('(min-width: 1024px)', () => {
    let totalLength = 0
    try {
      totalLength = path.getTotalLength()
    } catch (e) {
      totalLength = 0
    }
    if (totalLength <= 0) return

    const startPt = path.getPointAtLength(0)

    gsap.set(vectorWrapper, { opacity: 1 })
    gsap.set(path, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength
    })
    dot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
    gsap.set(dot, {
      opacity: 0,
      scale: 0,
      transformOrigin: 'center center'
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: problemsSection,
        start: 'top 70%',
        once: true
      }
    })

    // Dot appears at start of path
    tl.to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.8)'
    })

    // Dot moves along the curve, uncovering the line behind itself
    const progressObj = { value: 0 }
    tl.to(progressObj, {
      value: 1,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        const dist = progressObj.value * totalLength
        const pt = path.getPointAtLength(dist)
        dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
        path.style.strokeDashoffset = `${(totalLength - dist).toFixed(2)}`
      },
      onComplete: () => {
        const endPt = path.getPointAtLength(totalLength)
        dot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' })
      }
    })

    return () => {
      gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
    }
  })

  // Below 1024px, reset styles cleanly
  mm.add('(max-width: 1023px)', () => {
    gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
  })
}

function initEducationAnimation() {
  if (!window.gsap) return

  const gsap = window.gsap
  const educationSection = document.querySelector('.rws-education')
  const headerVector = document.querySelector('.rws-education-header-vector')
  const headerPath = document.querySelector('.rws-education-header-path')
  const headerDot = document.querySelector('.rws-education-header-dot')

  const container = document.querySelector('.education-banner-track')
  const path = container ? container.querySelector('.education-track-path') : null
  const dots = container ? container.querySelectorAll('.education-track-dot') : []
  const itemMiddle = container ? container.querySelector('.education-item-middle') : null
  const itemLeft = container ? container.querySelector('.education-item-left') : null
  const itemRight = container ? container.querySelector('.education-item-right') : null

  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    // 1. Header vector road uncovering animation (Как проходило обучение)
    if (headerPath && headerDot) {
      let headerLength = 0
      try {
        headerLength = headerPath.getTotalLength()
      } catch (e) {
        headerLength = 0
      }

      if (headerLength > 0) {
        const startPt = headerPath.getPointAtLength(0)

        gsap.set(headerVector, { opacity: 1 })
        gsap.set(headerPath, {
          strokeDasharray: headerLength,
          strokeDashoffset: headerLength
        })
        headerDot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
        gsap.set(headerDot, {
          opacity: 0,
          scale: 0,
          transformOrigin: 'center center'
        })

        const headerTl = gsap.timeline({
          scrollTrigger: {
            trigger: headerVector || educationSection,
            start: 'top 80%',
            once: true
          }
        })

        // Circle appears at start of path
        headerTl.to(headerDot, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'back.out(1.8)'
        })

        // Circle moves along the path and reveals the line directly behind it
        const progressObj = { value: 0 }
        headerTl.to(progressObj, {
          value: 1,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            const dist = progressObj.value * headerLength
            const pt = headerPath.getPointAtLength(dist)
            headerDot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
            headerPath.style.strokeDashoffset = `${(headerLength - dist).toFixed(2)}`
          },
          onComplete: () => {
            const endPt = headerPath.getPointAtLength(headerLength)
            headerDot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
            gsap.set(headerPath, { clearProps: 'strokeDasharray,strokeDashoffset' })
          }
        })
      }
    }

    // 2. Banner track railway departure animation
    if (container && path && itemMiddle && itemLeft && itemRight) {
      const totalLength = path.getTotalLength()

      // Initial state: hide track and side items, prepare middle item
      gsap.set(itemMiddle, {
        opacity: 0,
        scale: 0.8,
        y: 20
      })
      gsap.set([itemLeft, itemRight], {
        opacity: 0,
        scale: 0.85
      })
      gsap.set(itemLeft, { x: 120 }) // starts shifted towards middle
      gsap.set(itemRight, { x: -120 }) // starts shifted towards middle

      gsap.set(path, {
        strokeDasharray: totalLength,
        strokeDashoffset: totalLength
      })
      gsap.set(dots, {
        opacity: 0,
        scale: 0,
        transformOrigin: 'center center',
        transformBox: 'fill-box'
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 75%',
          once: true
        }
      })

      // Step 1: Middle item (Экибастуз) appears first smoothly
      tl.to(itemMiddle, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      // Step 2: Track line draws outward from middle towards left and right like train tracks
      .to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut'
      }, '-=0.2')
      // Station dots pop in along the way
      .to(dots, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'back.out(2)'
      }, '-=1.0')
      // Step 3: Left and right items depart/travel along the line to their places
      .to([itemLeft, itemRight], {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' })
        }
      }, '-=0.8')
    }

    return () => {
      if (headerVector) gsap.set([headerVector, headerPath, headerDot], { clearProps: 'all' })
      if (container) gsap.set([container, path, itemMiddle, itemLeft, itemRight, ...dots], { clearProps: 'all' })
    }
  })

  mm.add('(max-width: 1023px)', () => {
    if (headerVector) gsap.set([headerVector, headerPath, headerDot], { clearProps: 'all' })
    if (container) gsap.set([container, path, itemMiddle, itemLeft, itemRight, ...dots], { clearProps: 'all' })
  })
}

function initSpecialsAnimation() {
  const section = document.querySelector('.rws-specials')
  if (!section) return

  // 1. Header vector uncovering animation (Особенности проекта)
  const headerVector = section.querySelector('.rws-specials-header-vector')
  const headerPath = section.querySelector('.rws-specials-header-path')
  const headerDot = section.querySelector('.rws-specials-header-dot')

  if (window.gsap && headerPath && headerDot) {
    const gsap = window.gsap
    let pathLength = 0
    try {
      pathLength = headerPath.getTotalLength()
    } catch (e) {
      pathLength = 0
    }

    if (pathLength > 0) {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 640px)', () => {
        const startPt = headerPath.getPointAtLength(0)

        // Set initial state: path hidden, circle at start of path
        gsap.set(headerPath, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength
        })
        headerDot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
        gsap.set(headerDot, {
          opacity: 0,
          scale: 0,
          transformOrigin: 'center center'
        })

        const headerTl = gsap.timeline({
          scrollTrigger: {
            trigger: headerVector,
            start: 'top 85%',
            once: true
          }
        })

        // Circle appears at start point
        headerTl.to(headerDot, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'back.out(1.8)'
        })

        // Circle traverses the vector curve and uncovers the road behind itself
        const progressObj = { value: 0 }
        headerTl.to(progressObj, {
          value: 1,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            const dist = progressObj.value * pathLength
            const pt = headerPath.getPointAtLength(dist)
            headerDot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
            headerPath.style.strokeDashoffset = `${(pathLength - dist).toFixed(2)}`
          },
          onComplete: () => {
            const endPt = headerPath.getPointAtLength(pathLength)
            headerDot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
            gsap.set(headerPath, { clearProps: 'strokeDasharray,strokeDashoffset' })
          }
        })

        return () => {
          gsap.set([headerPath, headerDot], { clearProps: 'all' })
        }
      })

      mm.add('(max-width: 639px)', () => {
        gsap.set([headerPath, headerDot], { clearProps: 'all' })
      })
    }
  }

  // 2. Continuous train dots on the railway roadmap track
  const motionPath = section.querySelector('#specials-train-path')
  const dots = Array.from(section.querySelectorAll('.specials-train-dot'))
  if (!motionPath || dots.length === 0) return

  let totalLength = 0
  try {
    totalLength = motionPath.getTotalLength()
  } catch (e) {
    return
  }

  if (!totalLength || totalLength <= 0) return

  // Duration in seconds for a dot to traverse the entire track line
  const loopDuration = 22
  let progress = 0
  let lastTime = null
  let animFrameId = null
  let isVisible = false

  const numDots = dots.length
  // Fade distance at the ends (px)
  const fadeDist = 120

  function render(time) {
    if (!lastTime) lastTime = time
    const dt = Math.min((time - lastTime) / 1000, 0.1)
    lastTime = time

    progress = (progress + dt / loopDuration) % 1

    for (let i = 0; i < numDots; i++) {
      const dot = dots[i]
      const dotProgress = (progress + i / numDots) % 1
      const dist = dotProgress * totalLength
      const pt = motionPath.getPointAtLength(dist)

      dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)

      // Smooth fade-in at the entry and fade-out at the exit
      let opacity = 1
      if (dist < fadeDist) {
        opacity = dist / fadeDist
      } else if (dist > totalLength - fadeDist) {
        opacity = (totalLength - dist) / fadeDist
      }
      dot.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(3)
    }

    if (isVisible) {
      animFrameId = requestAnimationFrame(render)
    }
  }

  function start() {
    if (!animFrameId) {
      lastTime = null
      animFrameId = requestAnimationFrame(render)
    }
  }

  function stop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
      lastTime = null
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting && window.innerWidth >= 1024
          if (isVisible) {
            start()
          } else {
            stop()
          }
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(section)

    window.addEventListener('resize', () => {
      const shouldBeVisible = window.innerWidth >= 1024
      if (!shouldBeVisible && isVisible) {
        isVisible = false
        stop()
      } else if (shouldBeVisible && !isVisible) {
        const rect = section.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          isVisible = true
          start()
        }
      }
    })
  } else {
    isVisible = window.innerWidth >= 1024
    if (isVisible) start()
  }
}

function initResultAnimation() {
  const resultSection = document.querySelector('.rws-result')
  if (!resultSection) return

  const vectorWrapper = resultSection.querySelector('.rws-result-vector')
  const path = resultSection.querySelector('.rws-result-path')
  const dot = resultSection.querySelector('.rws-result-dot')

  if (!vectorWrapper || !path || !dot) return

  const gsap = window.gsap
  if (!gsap) return

  let mm = gsap.matchMedia()

  // Animate drawing only for screens >= lg (1024px)
  mm.add('(min-width: 1024px)', () => {
    let totalLength = 0
    try {
      totalLength = path.getTotalLength()
    } catch (e) {
      totalLength = 0
    }
    if (totalLength <= 0) return

    const startPt = path.getPointAtLength(0)

    gsap.set(vectorWrapper, { opacity: 1 })
    gsap.set(path, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength
    })
    dot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
    gsap.set(dot, {
      opacity: 0,
      scale: 0,
      transformOrigin: 'center center'
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: resultSection,
        start: 'top 70%',
        once: true
      }
    })

    // Dot appears at start of path
    tl.to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.8)'
    })

    // Dot moves along the curve, uncovering the line behind itself
    const progressObj = { value: 0 }
    tl.to(progressObj, {
      value: 1,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        const dist = progressObj.value * totalLength
        const pt = path.getPointAtLength(dist)
        dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
        path.style.strokeDashoffset = `${(totalLength - dist).toFixed(2)}`
      },
      onComplete: () => {
        const endPt = path.getPointAtLength(totalLength)
        dot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' })
      }
    })

    return () => {
      gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
    }
  })

  // Below 1024px, reset styles cleanly
  mm.add('(max-width: 1023px)', () => {
    gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
  })
}

function initFollowingAnimation() {
  const section = document.querySelector('.rws-following')
  if (!section || !window.gsap) return

  const gsap = window.gsap
  const cards = section.querySelectorAll('.rws-following-card')
  const numbers = section.querySelectorAll('.following-number')
  const content = section.querySelector('.rws-following-content')
  const vectorWrapper = section.querySelector('.rws-following-vector')
  const path = section.querySelector('.rws-following-path')
  const dot = section.querySelector('.rws-following-dot')

  if (!cards.length) return

  const mm = gsap.matchMedia()

  // Desktop (>= 1280px / xl)
  mm.add('(min-width: 1280px)', () => {
    // Initial hidden state
    gsap.set(cards, {
      opacity: 0,
      x: -140
    })
    if (numbers.length) {
      gsap.set(numbers, {
        opacity: 0,
        x: -40
      })
    }
    if (content) {
      gsap.set(content, {
        opacity: 0,
        y: 40
      })
    }

    let totalLength = 0
    if (path) {
      try {
        totalLength = path.getTotalLength()
      } catch (e) {
        totalLength = 0
      }
    }

    if (vectorWrapper && path && dot && totalLength > 0) {
      const startPt = path.getPointAtLength(0)
      gsap.set(vectorWrapper, { opacity: 1 })
      gsap.set(path, {
        strokeDasharray: totalLength,
        strokeDashoffset: totalLength
      })
      dot.setAttribute('transform', `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})`)
      gsap.set(dot, {
        opacity: 0,
        scale: 0,
        transformOrigin: 'center center'
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true
      }
    })

    // 1. Vector line draws and dot moves along curve
    if (vectorWrapper && path && dot && totalLength > 0) {
      tl.to(
        dot,
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'back.out(1.8)'
        },
        0
      )

      const progressObj = { value: 0 }
      tl.to(
        progressObj,
        {
          value: 1,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            const dist = progressObj.value * totalLength
            const pt = path.getPointAtLength(dist)
            dot.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
            path.style.strokeDashoffset = `${(totalLength - dist).toFixed(2)}`
          },
          onComplete: () => {
            const endPt = path.getPointAtLength(totalLength)
            dot.setAttribute('transform', `translate(${endPt.x.toFixed(2)}, ${endPt.y.toFixed(2)})`)
            gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' })
          }
        },
        0.15
      )
    }

    // 2. Text content slides in gently
    if (content) {
      tl.to(
        content,
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        },
        0
      )
    }

    // 3. Decorative numbers softly reveal
    if (numbers.length) {
      tl.to(
        numbers,
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          stagger: 0.18,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        },
        0.05
      )
    }

    // 4. Cards glide in smoothly with a slow, silky deceleration
    tl.to(
      cards,
      {
        opacity: 1,
        x: 0,
        duration: 1.4,
        stagger: 0.18,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      },
      0.1
    )

    return () => {
      gsap.set([cards, numbers, content], { clearProps: 'all' })
      if (vectorWrapper && path && dot) {
        gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
      }
    }
  })

  // Tablet & Mobile (< 1280px)
  mm.add('(max-width: 1279px)', () => {
    gsap.set(cards, { opacity: 0, x: -50 })
    if (content) gsap.set(content, { opacity: 0, y: 25 })
    if (vectorWrapper && path && dot) {
      gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    })

    if (content) {
      tl.to(content, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      }, 0)
    }

    tl.to(cards, {
      opacity: 1,
      x: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    }, 0.1)

    return () => {
      gsap.set([cards, numbers, content], { clearProps: 'all' })
      if (vectorWrapper && path && dot) {
        gsap.set([vectorWrapper, path, dot], { clearProps: 'all' })
      }
    }
  })
}

function initReviewAnimation() {
  const reviewSection = document.querySelector('.rws-review')
  if (!reviewSection || !window.gsap) return

  const gsap = window.gsap
  const header = reviewSection.querySelector('.rws-review-header')
  const author = reviewSection.querySelector('.rws-review-author')
  const reviewBody = reviewSection.querySelector('.rws-review-body')
  const reviewQuote = reviewSection.querySelector('.rws-review-quote')

  if (!reviewBody || !reviewQuote) return

  const mm = gsap.matchMedia()

  // Animate starting from lg (min-width: 1024px)
  mm.add('(min-width: 1024px)', () => {
    // 1-й блок (основной отзыв) начинает СПРАВА (+110px) и плавно едет влево
    gsap.set(reviewBody, {
      opacity: 0,
      x: 110
    })

    // 2-й блок (благодарность) начинает СЛЕВА (-110px) и плавно едет вправо
    gsap.set(reviewQuote, {
      opacity: 0,
      x: -110
    })

    if (header) {
      gsap.set(header, {
        opacity: 0,
        y: 20
      })
    }

    if (author) {
      gsap.set(author, {
        opacity: 0,
        x: -25
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: reviewSection,
        start: 'top 75%',
        once: true
      }
    })

    // Заголовок и автор мягко проявляются
    if (header) {
      tl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      })
    }

    if (author) {
      tl.to(
        author,
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        },
        header ? '-=0.5' : 0
      )
    }

    // 1-й блок плавно появляется СПРАВА с плавным стартом и ускорением (power2.inOut)
    tl.to(
      reviewBody,
      {
        opacity: 1,
        x: 0,
        duration: 1.35,
        ease: 'power2.inOut',
        clearProps: 'transform,opacity'
      },
      '-=0.4'
    )

    // 2-й блок плавно появляется СЛЕВА навстречу с плавным стартом и ускорением (power2.inOut)
    tl.to(
      reviewQuote,
      {
        opacity: 1,
        x: 0,
        duration: 1.35,
        ease: 'power2.inOut',
        clearProps: 'transform,opacity'
      },
      '-=0.95'
    )

    return () => {
      gsap.set([header, author, reviewBody, reviewQuote].filter(Boolean), { clearProps: 'all' })
    }
  })

  // Screens < lg (< 1024px): reset cleanly to static layout without shifts
  mm.add('(max-width: 1023px)', () => {
    gsap.set([header, author, reviewBody, reviewQuote].filter(Boolean), { clearProps: 'all' })
  })
}

function initAllAnimations() {
  initHeroAnimation()
  initGoalAnimation()
  initProblemsAnimation()
  initEducationAnimation()
  initSpecialsAnimation()
  initResultAnimation()
  initFollowingAnimation()
  initReviewAnimation()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnimations)
} else {
  initAllAnimations()
}