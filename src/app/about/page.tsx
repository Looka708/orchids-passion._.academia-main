
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Heart, Users, Target, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We are committed to the highest standards of teaching and academic rigor to ensure our students succeed."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Our love for teaching and learning drives us to inspire and motivate every student who walks through our doors."
  },
  {
    icon: Users,
    title: "Student-Centric Approach",
    description: "We put our students at the heart of everything we do, tailoring our methods to their unique needs."
  },
  {
    icon: BookOpen,
    title: "Integrity",
    description: "We uphold the principles of honesty, transparency, and ethical conduct in all our interactions."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-muted/40 pt-20 pb-10 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center">
                 <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                    Our Story
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                    Founded on a passion for education and a commitment to excellence, Passion Academia is dedicated to empowering students to achieve their academic and career aspirations.
                </p>
            </div>
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-xl">
                 <Image src="/story.png" alt="Team of educators" layout="fill" objectFit="cover" />
            </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Target className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Our mission is to provide high-quality, accessible, and personalized education that fosters intellectual growth, critical thinking, and a lifelong love for learning. We aim to equip students with the knowledge and skills necessary to excel in their exams and future endeavors.
                        </p>
                    </CardContent>
                </Card>
                 <Card className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                         <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Our vision is to be a leading educational institution recognized for our innovative teaching methods, unwavering commitment to student success, and positive impact on the community. We aspire to create a future where every student can reach their full potential.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>

       {/* Meet the Founder Section */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 items-center">
                <div className="md:col-span-1 flex justify-center">
                     <div className="relative h-48 w-48 rounded-full overflow-hidden shadow-lg ring-4 ring-primary/20">
                        <Image src="/Me.png" alt="Muhammad Nadeem Sabri, Founder" layout="fill" objectFit="cover" />
                    </div>
                </div>
                <div className="md:col-span-2 text-center md:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Meet Our Founder</h2>
                    <h3 className="text-2xl font-semibold mt-1">Muhammad Nadeem Sabri</h3>
                    <p className="mt-4 text-muted-foreground">
                        Passion Academia was born from the vision of Muhammad Nadeem Sabri, an educator with a deep-seated belief in the transformative power of knowledge. With years of experience in guiding students to success, he established this academy to create a supportive and challenging environment where passion meets purpose. His dedication to student success is the cornerstone of our philosophy.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold tracking-tight">Our Core Values</h2>
                 <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">The principles that guide our every action and decision.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value) => (
                    <div key={value.title} className="text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <value.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                        <p className="mt-2 text-muted-foreground">{value.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

       {/* CTA Section */}
      <section className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
                Join a Community of Passionate Learners
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Ready to start your journey with us? Explore our courses or contact our team to find the perfect fit for your goals.
            </p>
            <div className="mt-8">
                 <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                    <Link href="/contact">
                        Enroll Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
      </section>
    </div>
  );
}
