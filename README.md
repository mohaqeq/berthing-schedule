# Berthing Schedule Component

A native Web Component for visualizing and managing vessel berth schedules at ports. Built with Lit and TypeScript.

## Features

- **Interactive Schedule Visualization**: Gantt-chart-like interface displaying vessels across berths and timelines
- **Drag-and-Drop Operations**: Move vessels between berths, adjust arrival/departure times, and resize operations
- **Multiple Item Types**: Support for vessel calls and non-working periods (maintenance, planning)
- **Flexible Configuration**: Customizable berths, bollards, timeline periods, and styling via CSS properties
- **Rich Interactions**: Keyboard navigation, zoom controls (0.5x-2.0x), scroll tracking, and event logging
- **Data Integrity**: Lock options, voyage timing management, and automatic timing adjustments

Demo link: https://berthing.netlify.app/

## Technology Stack

- **Lit** - Lightweight web component library
- **TypeScript** - Type-safe development with ES2022 target
- **Vite** - Fast bundler and dev server
- **Native Web Components** - Standards-based custom elements

## Getting Started

```bash
# Install dependencies
npm install

# Run development server with demo
npm run dev

# Build for production
npm run build
```

Visit the demo at `http://localhost:5173` to see interactive examples with vessel scheduling and real-time event logging.

## Project Structure

- `/src/components/` - Core component implementations (berthing-schedule, vessel-box, quay-panel, timeline-panel)
- `/src/utils/` - Helper functions and utilities
- `/src/demo.ts` - Interactive demo application
- `/src/demo-data.ts` - Sample configuration and vessel data

## License

**Dual License:**

### Non-Commercial Use
This project is available under the **MIT License** for non-commercial purposes.

- Free to use, modify, and distribute for personal, educational, and open-source projects
- No cost for non-profit organizations and academic research

### Commercial Use
**Commercial license required** for any commercial or production use, including but not limited to:
- Using this component in commercial products or services
- Deploying in production environments for business purposes
- Internal business applications
- SaaS or hosted services that generate revenue

For commercial licensing inquiries, pricing, or to purchase a commercial license, please contact the maintainer.

See [LICENSE](LICENSE) for full terms.

## Contributing

Contributions are welcome! Please ensure TypeScript strict mode compliance and include appropriate tests.
