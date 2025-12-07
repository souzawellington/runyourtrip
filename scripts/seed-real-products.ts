/**
 * Seed Real Travel Products for Run Your Trip
 * 
 * This script populates the database with real travel-related products
 * to replace the demo "English for Tech" products.
 * 
 * Run with: npx tsx scripts/seed-real-products.ts
 */

import { db } from '../server/db';
import { templates, categories } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Travel product categories
const TRAVEL_CATEGORIES = [
    { id: 9, name: 'Travel Blog', description: 'Templates para blogs de viagem' },
    { id: 10, name: 'Hotel Booking', description: 'Sistemas de reserva de hotéis' },
    { id: 11, name: 'Booking Platform', description: 'Plataformas de reservas' },
    { id: 12, name: 'Travel Guide', description: 'Guias turísticos' },
    { id: 13, name: 'Travel Agency', description: 'Sites de agências de viagem' },
    { id: 14, name: 'Tour Operator', description: 'Plataformas de operadores turísticos' },
    { id: 15, name: 'Travel Portfolio', description: 'Portfólios de fotografia de viagem' },
];

// Real travel products to seed
const TRAVEL_PRODUCTS = [
    // ===== SAAS KITS (Premium) =====
    {
        name: 'BookIt Pro - Sistema de Reservas',
        description: 'Sistema completo de reservas para hotéis e pousadas. Inclui calendário de disponibilidade, gateway de pagamento integrado (Stripe), painel administrativo, e sistema de notificações por email. Perfeito para hoteleiros que querem automatizar reservas.',
        category: 'Booking Platform',
        categoryId: 11,
        price: '499.00',
        tags: ['saas', 'booking', 'hotel', 'stripe', 'react', 'nodejs'],
        status: 'published',
        featured: true,
    },
    {
        name: 'TravelHub AI - Plataforma de Roteiros',
        description: 'Plataforma SaaS que gera roteiros de viagem personalizados com IA. Integração com OpenAI para sugestões inteligentes, sistema de usuários, painel de afiliados, e marketplace de experiências. Para agências que querem escalar.',
        category: 'Travel Agency',
        categoryId: 13,
        price: '599.00',
        tags: ['saas', 'ai', 'openai', 'roteiros', 'agencia'],
        status: 'published',
        featured: true,
    },
    {
        name: 'TourMaster - Gestão de Passeios',
        description: 'Software completo para operadores de turismo. Gerencie passeios, guias, veículos e clientes em uma única plataforma. Inclui app mobile para guias, check-in QR code, e relatórios de comissões.',
        category: 'Tour Operator',
        categoryId: 14,
        price: '449.00',
        tags: ['saas', 'tour', 'gestao', 'mobile', 'qrcode'],
        status: 'published',
        featured: true,
    },

    // ===== PREMIUM TEMPLATES =====
    {
        name: 'Wanderlust - Blog de Viagem Moderno',
        description: 'Template premium para blogs de viagem com design moderno e SEO otimizado. Inclui galeria de fotos, mapa interativo de destinos visitados, integração com Instagram, e sistema de newsletter. Responsivo e rápido.',
        category: 'Travel Blog',
        categoryId: 9,
        price: '149.00',
        tags: ['blog', 'viagem', 'seo', 'instagram', 'newsletter'],
        status: 'published',
        featured: true,
    },
    {
        name: 'Luxe Resort - Site para Hotéis de Luxo',
        description: 'Template elegante para hotéis e resorts de luxo. Design sofisticado com galeria de quartos, tour virtual 360°, sistema de reservas simplificado, e seção de spa/restaurante. Impressione seus hóspedes desde o primeiro clique.',
        category: 'Hotel Booking',
        categoryId: 10,
        price: '199.00',
        tags: ['hotel', 'resort', 'luxo', '360', 'reservas'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Backpacker - Guia de Viagem Interativo',
        description: 'Template para guias de viagem com mapas interativos, dicas locais, calculadora de orçamento, e checklist de mala. Perfeito para blogueiros de viagem que querem monetizar conteúdo.',
        category: 'Travel Guide',
        categoryId: 12,
        price: '89.00',
        tags: ['guia', 'mapa', 'orcamento', 'checklist', 'mochileiro'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Expedition - Portfólio de Fotógrafo',
        description: 'Portfólio minimalista e impactante para fotógrafos de viagem. Galerias em grid, lightbox, proteção de imagens, e integração com prints on demand. Mostre seu trabalho com elegância.',
        category: 'Travel Portfolio',
        categoryId: 15,
        price: '129.00',
        tags: ['portfolio', 'fotografia', 'galeria', 'prints'],
        status: 'published',
        featured: false,
    },
    {
        name: 'TravelAgency Plus - Site de Agência',
        description: 'Template completo para agências de viagem. Catálogo de pacotes, formulário de orçamento, chat ao vivo, depoimentos de clientes, e integração com WhatsApp. Converta visitantes em clientes.',
        category: 'Travel Agency',
        categoryId: 13,
        price: '179.00',
        tags: ['agencia', 'pacotes', 'whatsapp', 'chat', 'orcamento'],
        status: 'published',
        featured: false,
    },

    // ===== STARTER TEMPLATES =====
    {
        name: 'Simple Stay - Landing Page de Hostel',
        description: 'Landing page moderna para hostels e albergues. Design clean, seção de quartos, galeria, mapa de localização, e formulário de contato. Ideal para pequenos estabelecimentos.',
        category: 'Hotel Booking',
        categoryId: 10,
        price: '49.00',
        tags: ['hostel', 'landing', 'simples', 'barato'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Nomad Blog - Blog Minimalista',
        description: 'Blog de viagem clean e minimalista. Foco no conteúdo com tipografia elegante, categorias por destino, e design responsivo. Perfeito para quem está começando.',
        category: 'Travel Blog',
        categoryId: 9,
        price: '59.00',
        tags: ['blog', 'minimalista', 'iniciante', 'responsivo'],
        status: 'published',
        featured: false,
    },
    {
        name: 'City Guide - Guia de Cidade',
        description: 'Template para guias de cidade específica. Seções para restaurantes, atrações, transporte, e dicas locais. Customizável para qualquer destino.',
        category: 'Travel Guide',
        categoryId: 12,
        price: '69.00',
        tags: ['cidade', 'guia', 'local', 'restaurantes'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Adventure Tours - Site de Aventura',
        description: 'Template para operadores de tours de aventura. Destaque para fotos de ação, calendário de expedições, níveis de dificuldade, e equipamentos necessários.',
        category: 'Tour Operator',
        categoryId: 14,
        price: '99.00',
        tags: ['aventura', 'tour', 'expedicao', 'outdoor'],
        status: 'published',
        featured: false,
    },

    // ===== NICHE TEMPLATES =====
    {
        name: 'Cruise Liner - Site de Cruzeiros',
        description: 'Template especializado para cruzeiros. Showcase de cabines, itinerários interativos, deck plan, e sistema de reservas. Design náutico elegante.',
        category: 'Booking Platform',
        categoryId: 11,
        price: '249.00',
        tags: ['cruzeiro', 'maritimo', 'cabines', 'itinerario'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Safari Lodge - Eco Turismo',
        description: 'Template para lodges e eco resorts. Foco em sustentabilidade, galeria de vida selvagem, pacotes de safari, e integração com booking engines.',
        category: 'Hotel Booking',
        categoryId: 10,
        price: '189.00',
        tags: ['safari', 'eco', 'natureza', 'lodge'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Ski Resort - Estação de Esqui',
        description: 'Template para estações de esqui e resorts de neve. Condições da neve em tempo real, mapa de pistas, webcams, e reserva de equipamentos.',
        category: 'Hotel Booking',
        categoryId: 10,
        price: '229.00',
        tags: ['ski', 'neve', 'resort', 'inverno'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Beach Club - Resort de Praia',
        description: 'Template vibrante para beach clubs e resorts de praia. Design tropical, reserva de cabanas, cardápio do restaurante, e galeria de eventos.',
        category: 'Hotel Booking',
        categoryId: 10,
        price: '159.00',
        tags: ['praia', 'beach', 'clube', 'tropical'],
        status: 'published',
        featured: false,
    },

    // ===== SPECIALTY PRODUCTS =====
    {
        name: 'Travel API Kit - Integrações',
        description: 'Kit de integração com as principais APIs de viagem: Amadeus, Skyscanner, Booking.com, e TripAdvisor. Código documentado e exemplos de uso.',
        category: 'Booking Platform',
        categoryId: 11,
        price: '299.00',
        tags: ['api', 'integracao', 'amadeus', 'skyscanner'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Travel Influencer Kit',
        description: 'Kit completo para influenciadores de viagem: media kit, rate card, portfolio, e sistema de parcerias. Tudo que você precisa para profissionalizar.',
        category: 'Travel Portfolio',
        categoryId: 15,
        price: '119.00',
        tags: ['influencer', 'mediakit', 'parcerias', 'profissional'],
        status: 'published',
        featured: false,
    },
    {
        name: 'Destination Wedding - Casamentos',
        description: 'Template para destination weddings. Convite digital, RSVP system, galeria do casal, informações de viagem, e lista de presentes.',
        category: 'Travel Guide',
        categoryId: 12,
        price: '139.00',
        tags: ['casamento', 'destination', 'rsvp', 'convite'],
        status: 'published',
        featured: false,
    },
];

async function seedRealProducts() {
    console.log('🌱 Starting to seed real travel products...\n');

    try {
        // First, check existing products
        const existingProducts = await db.select().from(templates);
        console.log(`📦 Found ${existingProducts.length} existing products\n`);

        // Seed products
        let created = 0;
        let skipped = 0;

        for (const product of TRAVEL_PRODUCTS) {
            // Check if product already exists
            const exists = existingProducts.some(
                p => p.name.toLowerCase() === product.name.toLowerCase()
            );

            if (exists) {
                console.log(`⏭️ Skipping: ${product.name} (already exists)`);
                skipped++;
                continue;
            }

            // Create the product
            await db.insert(templates).values({
                userId: 'system',
                name: product.name,
                description: product.description,
                category: product.category,
                categoryId: product.categoryId,
                price: product.price,
                tags: product.tags,
                status: product.status,
                featured: product.featured,
                rating: '0',
                downloads: 0,
                sales: 0,
                code: null,
                preview: null,
            });

            console.log(`✅ Created: ${product.name} - R$${product.price}`);
            created++;
        }

        console.log('\n========================================');
        console.log(`🎉 Seed completed!`);
        console.log(`   Created: ${created} products`);
        console.log(`   Skipped: ${skipped} products`);
        console.log(`   Total in DB: ${existingProducts.length + created}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

// Run the seed
seedRealProducts()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
