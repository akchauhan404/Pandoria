import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { BookOpen, Sparkles, Image, Download, Loader2, Wand2, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [storyIdea, setStoryIdea] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [tone, setTone] = useState('lighthearted')
  const [targetAudience, setTargetAudience] = useState('general')
  const [artStyle, setArtStyle] = useState('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState(null)
  const [error, setError] = useState('')

  const genres = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Science Fiction' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'horror', label: 'Horror' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' }
  ]

  const tones = [
    { value: 'lighthearted', label: 'Lighthearted' },
    { value: 'dark', label: 'Dark' },
    { value: 'epic', label: 'Epic' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'serious', label: 'Serious' }
  ]

  const audiences = [
    { value: 'kids', label: 'Kids (5-10)' },
    { value: 'teens', label: 'Teens (11-17)' },
    { value: 'adults', label: 'Adults (18+)' },
    { value: 'general', label: 'General Audience' }
  ]

  const artStyles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'anime', label: 'Anime' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'oil painting', label: 'Oil Painting' },
    { value: 'digital art', label: 'Digital Art' },
    { value: 'sketch', label: 'Sketch' }
  ]

  const generateStory = async () => {
    if (!storyIdea.trim()) {
      setError('Please enter a story idea')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedStory(null)

    try {
      const response = await fetch('/api/generate-complete-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story_idea: storyIdea,
          genre,
          tone,
          target_audience: targetAudience,
          art_style: artStyle
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedStory(data)
    } catch (err) {
      console.error('Error generating story:', err)
      setError(`Failed to generate story: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadStory = () => {
    if (!generatedStory) return

    let content = `# ${generatedStory.title}\n\n`
    
    generatedStory.scenes.forEach((scene, index) => {
      content += `## ${scene.scene_title}\n\n`
      content += `${scene.content}\n\n`
      if (index < generatedStory.scenes.length - 1) {
        content += '---\n\n'
      }
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Pandoria
                </h1>
                <p className="text-sm text-muted-foreground">Create amazing stories with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Input Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>Create Your Story</span>
                </CardTitle>
                <CardDescription>
                  Enter your story idea and customize the settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="story-idea">Story Idea</Label>
                  <Textarea
                    id="story-idea"
                    placeholder="A young girl finds a secret door in her grandmother's attic..."
                    value={storyIdea}
                    onChange={(e) => setStoryIdea(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Art Style</Label>
                  <Select value={artStyle} onValueChange={setArtStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {artStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateStory} 
                  disabled={isGenerating || !storyIdea.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Story Display Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!generatedStory && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-16"
                >
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="h-12 w-12 text-purple-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Ready to Create Magic?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Enter your story idea and let AI bring it to life with beautiful illustrations and engaging narrative.
                  </p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Creating Your Story...
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI is crafting your narrative and generating beautiful illustrations
                  </p>
                </motion.div>
              )}

              {generatedStory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Story Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-3xl mb-2">{generatedStory.title}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{genre}</Badge>
                            <Badge variant="outline">{tone}</Badge>
                            <Badge variant="outline">{targetAudience}</Badge>
                            <Badge variant="outline">{artStyle}</Badge>
                          </div>
                        </div>
                        <Button onClick={downloadStory} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Story Scenes */}
                  <div className="space-y-8">
                    {generatedStory.scenes.map((scene, index) => (
                      <motion.div
                        key={scene.scene_number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <Card className="overflow-hidden">
                          <CardHeader>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {scene.scene_number}
                              </div>
                              <CardTitle className="text-xl">{scene.scene_title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {scene.image_data && (
                              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={`data:image/png;base64,${scene.image_data}`}
                                  alt={scene.scene_title}
                                  className="w-full h-64 sm:h-80 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              </div>
                            )}
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              {scene.content.split('\n').map((paragraph, pIndex) => (
                                paragraph.trim() && (
                                  <p key={pIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {paragraph}
                                  </p>
                                )
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Story Footer */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">Created with AI Storyteller</span>
                          <Star className="h-4 w-4" />
                        </div>
                        <Button onClick={() => {
                          setGeneratedStory(null)
                          setStoryIdea('')
                        }} variant="outline">
                          Create Another Story
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

