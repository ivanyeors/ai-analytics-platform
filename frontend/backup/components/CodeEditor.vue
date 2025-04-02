<template>
  <div class="code-editor-container">
    <div class="editor-header">
      <h3>{{ title }}</h3>
      <div class="actions">
        <button @click="executeCode" class="execute-btn">Execute</button>
        <button @click="generateAICode" class="ai-btn">AI Enhance</button>
        <button @click="resetCode" class="reset-btn">Reset</button>
      </div>
    </div>
    
    <div ref="editorContainer" class="monaco-editor"></div>
    
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';

// This is a placeholder for Monaco Editor - in a real implementation
// you'd import Monaco or another code editor like CodeMirror
const mockMonacoEditor = {
  create(element, options) {
    const editor = document.createElement('textarea');
    editor.value = options.value || '';
    editor.style.width = '100%';
    editor.style.height = '200px';
    editor.style.fontFamily = 'monospace';
    editor.style.padding = '8px';
    editor.style.border = '1px solid #ddd';
    editor.style.borderRadius = '4px';
    
    // Clear the element
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    element.appendChild(editor);
    
    return {
      getValue: () => editor.value,
      setValue: (value) => { editor.value = value },
      layout: () => {},
      dispose: () => {},
      _element: editor
    };
  }
};

export default defineComponent({
  name: 'CodeEditor',
  
  props: {
    code: {
      type: String,
      default: '// Edit this code to modify the chart\n' +
        'Plot.plot({\n' +
        '  marks: [\n' +
        '    Plot.line(data, {x: "timestamp", y: "value", stroke: "category"})\n' +
        '  ],\n' +
        '  grid: true\n' +
        '})'
    },
    title: {
      type: String,
      default: 'Chart Code Editor'
    },
    language: {
      type: String,
      default: 'javascript'
    },
    data: {
      type: Array,
      required: true
    }
  },
  
  emits: ['execute', 'update:code'],
  
  setup(props, { emit }) {
    const editorContainer = ref(null);
    const error = ref(null);
    let editor = null;
    
    // Example AI-enhanced code snippets
    const aiCodeSnippets = [
      // Line chart with trend line
      `// AI-enhanced line chart with trend line
Plot.plot({
  marks: [
    Plot.line(data, {x: "timestamp", y: "value", stroke: "category"}),
    Plot.trend(data, {x: "timestamp", y: "value", stroke: "steelblue", strokeWidth: 2})
  ],
  grid: true,
  x: {
    label: "Time"
  },
  y: {
    label: "Value",
    nice: true
  }
})`,
      // Bar chart with error bars
      `// AI-enhanced bar chart with statistics
Plot.plot({
  marks: [
    Plot.barY(data, {x: "category", y: "value", fill: "category"}),
    Plot.frame()
  ],
  grid: true,
  x: {
    label: "Category"
  },
  y: {
    label: "Average Value",
    nice: true
  }
})`,
      // Dot plot with regression line
      `// AI-enhanced scatter plot with regression
Plot.plot({
  marks: [
    Plot.dot(data, {
      x: "timestamp", 
      y: "value", 
      fill: "category",
      r: 4,
      opacity: 0.7
    }),
    Plot.linearRegressionY(data, {
      x: "timestamp", 
      y: "value", 
      stroke: "red",
      strokeWidth: 2
    })
  ],
  grid: true,
  color: {
    legend: true
  }
})`,
      // Heatmap
      `// AI-enhanced heatmap visualization
const bins = Plot.bin({r: "value", x: "timestamp", fill: "count"}, {x: "timestamp", y: "category", fill: "value", r: "value"}, data);
Plot.plot({
  marks: [
    Plot.cell(bins, {
      x: "timestamp", 
      y: "category", 
      fill: "count",
      stroke: "white"
    })
  ],
  color: {
    type: "sequential",
    scheme: "viridis"
  },
  grid: true
})`
    ];
    
    // Initialize the editor
    const initEditor = () => {
      if (!editorContainer.value) return;
      
      try {
        editor = mockMonacoEditor.create(editorContainer.value, {
          value: props.code,
          language: props.language,
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false }
        });
      } catch (e) {
        error.value = `Error initializing code editor: ${e.message}`;
        console.error('Error initializing code editor:', e);
      }
    };
    
    // Execute the code
    const executeCode = () => {
      if (!editor) return;
      
      try {
        error.value = null;
        const code = editor.getValue();
        emit('update:code', code);
        
        // Create a function to execute the code with the data
        const executeFunction = new Function('Plot', 'data', `return ${code}`);
        
        // Execute and emit the result
        emit('execute', {
          code,
          executor: executeFunction
        });
      } catch (e) {
        error.value = `Error executing code: ${e.message}`;
        console.error('Error executing code:', e);
      }
    };
    
    // Reset the code to the default
    const resetCode = () => {
      if (!editor) return;
      
      editor.setValue(props.code);
      emit('update:code', props.code);
    };
    
    // Generate AI-enhanced code
    const generateAICode = () => {
      if (!editor) return;
      
      // Randomly select an AI-enhanced code snippet
      const randomIndex = Math.floor(Math.random() * aiCodeSnippets.length);
      const enhancedCode = aiCodeSnippets[randomIndex];
      
      // Set the editor value
      editor.setValue(enhancedCode);
      emit('update:code', enhancedCode);
      
      // Auto-execute after a short delay
      setTimeout(executeCode, 500);
    };
    
    // Initialize when mounted
    onMounted(() => {
      initEditor();
    });
    
    // Update editor when the code prop changes
    watch(() => props.code, (newValue) => {
      if (editor && newValue !== editor.getValue()) {
        editor.setValue(newValue);
      }
    });
    
    // Clean up on unmount
    onUnmounted(() => {
      if (editor) {
        editor.dispose();
        editor = null;
      }
    });
    
    return {
      editorContainer,
      error,
      executeCode,
      resetCode,
      generateAICode
    };
  }
});
</script>

<style scoped>
.code-editor-container {
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.monaco-editor {
  height: 200px;
  width: 100%;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.execute-btn {
  background-color: #4caf50;
  color: white;
}

.execute-btn:hover {
  background-color: #388e3c;
}

.ai-btn {
  background-color: #2196f3;
  color: white;
}

.ai-btn:hover {
  background-color: #1976d2;
}

.reset-btn {
  background-color: #f44336;
  color: white;
}

.reset-btn:hover {
  background-color: #d32f2f;
}

.error {
  padding: 10px;
  margin: 10px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
}
</style> 