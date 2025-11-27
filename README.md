# Algorithms Visualizer

An interactive web application for visualizing and understanding computer science algorithms through beautiful step-by-step animations.

**Developer:** Mohammed Abueldhb  
**Tech Stack:** React + Vite + TypeScript + Tailwind CSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📚 Features

- **13+ Algorithm Visualizations** - Including sorting, searching, and graph algorithms
- **Interactive Controls** - Play, pause, step forward/back, adjust speed and array size
- **Side-by-Side Comparison** - Race multiple algorithms to see performance differences
- **BLAKE2b Cryptographic Hash** - Educational visualization of cryptographic operations
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile devices
- **Code Display** - View implementation alongside visualizations

## 🎨 Algorithms Included

### Searching Algorithms
- Linear Search ✅ (Implemented)
- Binary Search ✅ (Implemented)
- Interpolation Search 🚧 (Coming Soon)
- Exponential Search 🚧 (Coming Soon)
- Fibonacci Search 🚧 (Coming Soon)

### Sorting Algorithms
- Quick Sort ✅ (Implemented)
- Merge Sort 🚧 (Coming Soon)
- Selection Sort 🚧 (Coming Soon)
- Insertion Sort 🚧 (Coming Soon)
- Heap Sort 🚧 (Coming Soon)

### Graph & Greedy Algorithms
- Prim's Algorithm 🚧 (Coming Soon)
- Kruskal's Algorithm 🚧 (Coming Soon)
- Dijkstra's Algorithm 🚧 (Coming Soon)

## 🛠️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn components
│   ├── TabBar.tsx      # Category tabs
│   ├── AlgorithmCard.tsx
│   ├── ControlsPanel.tsx
│   ├── CodePanel.tsx
│   └── Navigation.tsx
├── lib/
│   └── stepGenerators/ # Algorithm frame generators
│       ├── quickSort.ts
│       ├── binarySearch.ts
│       ├── linearSearch.ts
│       └── ...
├── pages/              # Route pages
│   ├── Home.tsx
│   ├── Algorithms.tsx
│   ├── Compare.tsx
│   ├── About.tsx
│   ├── Blake2bPage.tsx
│   └── algorithms/     # Individual algorithm pages
│       ├── quick-sort.tsx
│       ├── binary-search.tsx
│       └── ...
├── App.tsx             # Main app with routing
└── index.css           # Design system & styles
```

## 🎨 Customizing the Theme

All colors are defined using CSS variables in `src/index.css` and mapped in `tailwind.config.ts`. 

### Changing Colors

Edit the HSL values in `src/index.css`:

```css
:root {
  --color-navy: 210 85% 9%;       /* Dark background */
  --color-crimson: 349 76% 52%;   /* Primary red */
  --color-cyan: 187 67% 62%;      /* Accent cyan */
  /* ... more colors ... */
}
```

All components automatically use these semantic tokens, so changes propagate throughout the app.

## 📝 Adding a New Algorithm

### 1. Create Step Generator

Create a new file in `src/lib/stepGenerators/yourAlgorithm.ts`:

```typescript
export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateYourAlgorithmSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  
  // Add initial state
  frames.push({
    array: [...arr],
    labels: { title: 'Start', detail: 'Initial array' }
  });
  
  // Generate steps for each operation
  // ...
  
  return frames;
}
```

### 2. Create Visualizer Page

Create `src/pages/algorithms/your-algorithm.tsx` using the Quick Sort page as a template.

### 3. Add Route

Update `src/App.tsx`:

```typescript
import YourAlgorithm from "./pages/algorithms/your-algorithm";

// In Routes:
<Route path="/algorithms/your-algorithm" element={<YourAlgorithm />} />
```

### 4. Add to Algorithm List

Update `src/pages/Algorithms.tsx` to include your algorithm in the appropriate category.

## 🖼️ Adding Team Photos

Place team member photos in `public/images/team/` and update the `teamMembers` array in `src/pages/About.tsx`:

```typescript
const teamMembers = [
  { 
    name: "Your Name", 
    role: "Developer", 
    image: "/images/team/your-photo.jpg" 
  },
];
```

## 🔒 IMPORTANT: Preserving Existing Code

**CRITICAL:** If a Merge Sort implementation already exists in the repository, **DO NOT** overwrite or delete it. The current `src/lib/stepGenerators/mergeSort.ts` is a placeholder. If you find an existing implementation, replace the placeholder with that implementation and wire it into the routing.

## 📦 Build for Production

```bash
npm run build
npm run preview
```

The production build will be in the `dist/` folder.

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Acceptance Criteria

✅ Project runs with `npm install` && `npm run dev`  
✅ Home page with project overview  
✅ Algorithms page with category tabs and cards  
✅ Working visualizers for Quick Sort, Binary Search, Linear Search  
✅ Interactive controls (play/pause, speed, array size)  
✅ Compare page structure  
✅ BLAKE2b page structure  
✅ About page with team info  
✅ Responsive design  
✅ No console errors  

## 🚧 TODO

- [ ] Complete remaining algorithm visualizers
- [ ] Implement full Compare page functionality
- [ ] Complete BLAKE2b frame generator
- [ ] Add more graph algorithms
- [ ] Add export/screenshot functionality
- [ ] Add keyboard shortcuts
- [ ] Improve mobile experience
- [ ] Add algorithm explanations

## 📖 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/guide/)

## 📄 License

Educational project for algorithm visualization.

---

Built with ❤️ for learning and education
