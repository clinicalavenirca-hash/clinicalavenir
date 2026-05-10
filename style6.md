You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
flip-button.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'

export function FlipButton({ text1, text2 }:{text1: string, text2: string}) {
  const [show, setShow] = useState(false)
  const flipVariants = {
    one: {
      rotateX: 0,
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    two: {
      rotateX: 180,
      backgroundColor: '#f4f4f5',
      color: '#18181b',
    },
  }

  return (
      <div className="w-full max-w-[270px]">
        <motion.button
          className="w-full cursor-pointer px-6 py-3 font-medium"
          style={{
            borderRadius: 999,
          }}
          onClick={() => setShow(!show)}
          animate={show ? 'two' : 'one'}
          variants={flipVariants}
          transition={{ duration: 0.6, type: 'spring' }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotateX: show ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            {show ? text1 : text2}
          </motion.div>
          <motion.div
            animate={{ rotateX: show ? 0 : -180 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="absolute inset-0"
          ></motion.div>
        </motion.button>
      </div>
  );
};


demo.tsx
import { FlipButton } from "@/components/ui/flip-button"

export function FlipButtonDemo() {
  return <FlipButton text1="Cancel" text2="Submit" />;
}

```

Install NPM dependencies:
```bash
framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
