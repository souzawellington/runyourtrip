import { db } from "./db";
import { categories, templates, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Real English learning templates for tech professionals
const TECH_ENGLISH_TEMPLATES = [
  {
    name: "DevOps Communication Mastery",
    description: "Master essential English communication skills for DevOps professionals. Learn technical vocabulary, incident response communication, and cross-team collaboration in international environments.",
    category: "DevOps",
    price: "129",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOps Communication Mastery</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .code-highlight { background: #1e293b; border-radius: 8px; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="gradient-bg text-white py-16">
        <div class="container mx-auto px-6 text-center">
            <h1 class="text-4xl font-bold mb-4">DevOps Communication Mastery</h1>
            <p class="text-xl opacity-90">Essential English skills for international DevOps teams</p>
        </div>
    </div>
    
    <div class="container mx-auto px-6 py-12">
        <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">Learning Modules</h2>
                <ul class="space-y-3">
                    <li class="flex items-center">
                        <span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">1</span>
                        Incident Response Communication
                    </li>
                    <li class="flex items-center">
                        <span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">2</span>
                        Technical Documentation Writing
                    </li>
                    <li class="flex items-center">
                        <span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">3</span>
                        Cross-team Collaboration
                    </li>
                </ul>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">Interactive Practice</h2>
                <div class="code-highlight text-green-400 p-4 font-mono text-sm">
                    $ kubectl get pods --all-namespaces<br>
                    <span class="text-gray-400"># Practice explaining this command in English</span><br>
                    <span class="text-blue-400">Practice: "This command retrieves all pods across all namespaces in the cluster"</span>
                </div>
                <button class="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">Start Practice</button>
            </div>
        </div>
        
        <div class="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">Vocabulary Builder</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="bg-blue-100 rounded-lg p-4 mb-2">
                        <h3 class="font-bold text-blue-800">Infrastructure</h3>
                        <p class="text-sm text-gray-600">Essential infrastructure terms</p>
                    </div>
                </div>
                <div class="text-center">
                    <div class="bg-green-100 rounded-lg p-4 mb-2">
                        <h3 class="font-bold text-green-800">Monitoring</h3>
                        <p class="text-sm text-gray-600">Monitoring and alerting vocabulary</p>
                    </div>
                </div>
                <div class="text-center">
                    <div class="bg-purple-100 rounded-lg p-4 mb-2">
                        <h3 class="font-bold text-purple-800">Deployment</h3>
                        <p class="text-sm text-gray-600">CI/CD and deployment terms</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Interactive elements
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DevOps Communication course loaded');
            // Add interactive functionality here
        });
    </script>
</body>
</html>`,
    imageThumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80",
    previewUrl: "https://devops-english-demo.netlify.app",
    status: "published",
    trendingScore: 92,
    featured: true,
    sales: 156,
    downloads: 720,
    rating: "4.9",
    tags: ["devops", "communication", "intermediate", "technical-english"]
  },
  {
    name: "AI/ML Technical Presentations",
    description: "Perfect your English presentation skills for AI and Machine Learning contexts. Learn to explain complex algorithms, present research findings, and communicate with stakeholders effectively.",
    category: "AI/ML",
    price: "149",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI/ML Technical Presentations</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gradient-to-br from-indigo-50 to-purple-50">
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-6 py-4">
            <h1 class="text-3xl font-bold text-gray-800">AI/ML Technical Presentations</h1>
            <p class="text-gray-600">Master English for AI presentations and research communication</p>
        </div>
    </header>
    
    <main class="container mx-auto px-6 py-8">
        <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">Presentation Structure</h2>
                    <div class="space-y-4">
                        <div class="border-l-4 border-blue-500 pl-4">
                            <h3 class="font-semibold">Introduction Framework</h3>
                            <p class="text-gray-600">"Today, I'll present our novel approach to..."</p>
                        </div>
                        <div class="border-l-4 border-green-500 pl-4">
                            <h3 class="font-semibold">Methodology Explanation</h3>
                            <p class="text-gray-600">"Our algorithm utilizes a multi-layer architecture..."</p>
                        </div>
                        <div class="border-l-4 border-purple-500 pl-4">
                            <h3 class="font-semibold">Results Discussion</h3>
                            <p class="text-gray-600">"The evaluation metrics demonstrate significant improvement..."</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-2xl font-bold mb-4">Interactive Algorithm Explanation</h2>
                    <div class="bg-gray-100 rounded-lg p-4">
                        <canvas id="algorithmChart" width="400" height="200"></canvas>
                    </div>
                    <div class="mt-4 grid md:grid-cols-2 gap-4">
                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Explain in Simple Terms</button>
                        <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Technical Deep Dive</button>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4">Key Vocabulary</h3>
                    <div class="space-y-3">
                        <div class="bg-blue-50 p-3 rounded">
                            <strong>Neural Network:</strong><br>
                            <span class="text-sm text-gray-600">A computing system inspired by biological neural networks</span>
                        </div>
                        <div class="bg-green-50 p-3 rounded">
                            <strong>Gradient Descent:</strong><br>
                            <span class="text-sm text-gray-600">An optimization algorithm for finding minimum values</span>
                        </div>
                        <div class="bg-purple-50 p-3 rounded">
                            <strong>Overfitting:</strong><br>
                            <span class="text-sm text-gray-600">When a model learns training data too specifically</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4">Practice Scenarios</h3>
                    <ul class="space-y-2">
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Stakeholder Presentation
                        </li>
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Peer Review Session
                        </li>
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            Conference Talk
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
    
    <script>
        // Chart.js visualization
        const ctx = document.getElementById('algorithmChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5'],
                datasets: [{
                    label: 'Training Loss',
                    data: [0.8, 0.6, 0.4, 0.3, 0.2],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Model Training Progress'
                    }
                }
            }
        });
    </script>
</body>
</html>`,
    imageThumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    previewUrl: "https://aiml-presentations-demo.netlify.app",
    status: "published",
    trendingScore: 88,
    featured: true,
    sales: 203,
    downloads: 890,
    rating: "4.8",
    tags: ["ai", "ml", "presentations", "advanced", "research"]
  },
  {
    name: "Agile Scrum English Fluency",
    description: "Navigate Agile ceremonies and scrum meetings with confidence. Master standup communication, sprint planning vocabulary, and retrospective facilitation in English.",
    category: "Project Management",
    price: "89",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agile Scrum English Fluency</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="bg-gradient-to-r from-orange-400 to-red-500 text-white py-12">
        <div class="container mx-auto px-6 text-center">
            <h1 class="text-4xl font-bold mb-4">Agile Scrum English Fluency</h1>
            <p class="text-xl">Master English communication for Agile teams</p>
        </div>
    </div>
    
    <div class="container mx-auto px-6 py-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4 text-orange-600">Daily Standups</h2>
                <div class="space-y-3">
                    <div class="bg-orange-50 p-3 rounded">
                        <strong>Yesterday:</strong> "I completed the user authentication feature"
                    </div>
                    <div class="bg-orange-50 p-3 rounded">
                        <strong>Today:</strong> "I plan to work on the payment integration"
                    </div>
                    <div class="bg-orange-50 p-3 rounded">
                        <strong>Blockers:</strong> "I'm waiting for API documentation"
                    </div>
                </div>
                <button class="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Practice Standup</button>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4 text-blue-600">Sprint Planning</h2>
                <ul class="space-y-2">
                    <li>• Story pointing and estimation</li>
                    <li>• Capacity planning discussion</li>
                    <li>• Definition of Done criteria</li>
                    <li>• Sprint goal articulation</li>
                </ul>
                <div class="mt-4 bg-blue-50 p-3 rounded">
                    <strong>Practice:</strong> "I estimate this story as 5 points because..."
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4 text-green-600">Retrospectives</h2>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-green-100 p-2 rounded">
                        <strong>Start</strong><br>
                        <small>What should we start doing?</small>
                    </div>
                    <div class="bg-yellow-100 p-2 rounded">
                        <strong>Stop</strong><br>
                        <small>What should we stop doing?</small>
                    </div>
                    <div class="bg-blue-100 p-2 rounded">
                        <strong>Continue</strong><br>
                        <small>What's working well?</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-4">Interactive Scrum Simulation</h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold mb-3">Scenario: Sprint Review</h3>
                    <p class="text-gray-600 mb-4">You're presenting completed user stories to stakeholders. Practice explaining technical achievements in business terms.</p>
                    <div class="bg-gray-100 p-4 rounded">
                        <strong>Your turn:</strong> Explain the shopping cart feature you just completed.
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-3">Common Phrases</h3>
                    <ul class="space-y-2 text-sm">
                        <li>"We successfully delivered 8 out of 10 story points"</li>
                        <li>"This spike will help us understand the technical requirements"</li>
                        <li>"We encountered some technical debt that needs addressing"</li>
                        <li>"The velocity for this sprint was higher than expected"</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Add interactive scrum timer
            let standupTimer = 0;
            setInterval(() => {
                standupTimer++;
                if (standupTimer > 60) {
                    console.log('Standup is running long! Keep it brief.');
                }
            }, 1000);
        });
    </script>
</body>
</html>`,
    imageThumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    previewUrl: "https://agile-scrum-english-demo.netlify.app",
    status: "published",
    trendingScore: 85,
    featured: false,
    sales: 187,
    downloads: 650,
    rating: "4.7",
    tags: ["agile", "scrum", "project-management", "intermediate", "communication"]
  }
];

async function seedEnglishContent() {
  console.log("📚 Seeding English learning content for tech professionals...");

  try {
    // 1. Create or get English Learning category
    const englishCategory = await db.select()
      .from(categories)
      .where(eq(categories.name, "English Learning"))
      .limit(1);

    let categoryId;
    if (englishCategory.length === 0) {
      const newCategory = await db.insert(categories).values({
        name: "English Learning",
        slug: "english-learning",
        description: "Professional English courses for tech workers",
        icon: "BookOpen",
        displayOrder: 8
      }).returning();
      categoryId = newCategory[0].id;
      console.log("✅ Created English Learning category");
    } else {
      categoryId = englishCategory[0].id;
      console.log("📋 Using existing English Learning category");
    }

    // 2. Get demo user
    const demoUsers = await db.select().from(users).limit(1);
    const userId = demoUsers.length > 0 ? demoUsers[0].id : "demo-user";

    // 3. Create English learning templates (if they don't exist)
    console.log("🎯 Creating English learning templates...");
    
    let createdCount = 0;
    for (const template of TECH_ENGLISH_TEMPLATES) {
      // Check if template already exists
      const existingTemplate = await db.select()
        .from(templates)
        .where(eq(templates.name, template.name))
        .limit(1);
      
      if (existingTemplate.length === 0) {
        const templateData = {
          userId: userId,
          categoryId: categoryId,
          name: template.name,
          description: template.description,
          category: template.category,
          price: template.price,
          code: template.code,
          preview: template.code,
          previewUrl: template.previewUrl,
          imageThumbnailUrl: template.imageThumbnailUrl,
          gridViewImageUrl: template.gridViewImageUrl,
          status: template.status,
          trendingScore: template.trendingScore,
          featured: template.featured,
          sales: template.sales,
          downloads: template.downloads,
          rating: template.rating,
          tags: template.tags,
        };

        await db.insert(templates).values(templateData);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new English learning templates`);
    } else {
      console.log(`✅ All English learning templates already exist`);
    }
    console.log("🎉 English content seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding English content:", error);
    throw error;
  }
}

export { seedEnglishContent };