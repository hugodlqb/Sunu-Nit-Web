-- Initial import of the three legacy public news items.
-- Safe to rerun: news rows use stable IDs, translations use (news_id, locale),
-- and gallery rows use stable IDs. This file only imports data; it does not
-- create/alter tables, policies, grants, or Storage buckets.
BEGIN;

INSERT INTO public.news (
    id,
    status,
    published_at,
    cover_image_url,
    cover_image_alt
)
VALUES
    (
        'b1000000-0000-4000-8000-000000000001',
        'published',
        '2024-10-10T12:00:00Z',
        'https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=817',
        'Blankets'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        'published',
        '2024-09-24T12:00:00Z',
        'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400',
        'Charlas solidarias en institutos'
    ),
    (
        'b1000000-0000-4000-8000-000000000003',
        'published',
        '2024-08-05T12:00:00Z',
        'https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=400',
        'Ampliación de ducha sanitaria'
    )
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    cover_image_url = EXCLUDED.cover_image_url,
    cover_image_alt = EXCLUDED.cover_image_alt;

INSERT INTO public.news_translations (
    news_id,
    locale,
    title,
    summary,
    content
)
VALUES
    (
        'b1000000-0000-4000-8000-000000000001',
        'es',
        'Llegada de mantas de invierno',
        'Gracias a la campaña de otoño, ya se han distribuido mantas térmicas en el núcleo de Rufisque...',
        'Texto completo...'
    ),
    (
        'b1000000-0000-4000-8000-000000000001',
        'en',
        'Arrival of winter blankets',
        'Thanks to the autumn campaign, thermal blankets have already been distributed in Rufisque...',
        'Thanks to the autumn campaign, thermal blankets have been distributed among vulnerable children in Rufisque. This action helps them face the colder months with greater protection and dignity.'
    ),
    (
        'b1000000-0000-4000-8000-000000000001',
        'fr',
        'Arrivée des couvertures d''hiver',
        'Grâce à la campagne d''automne, des couvertures thermiques ont déjà été distribuées à Rufisque...',
        'Grâce à la campagne d''automne, des couvertures thermiques ont été distribuées aux enfants vulnérables de Rufisque. Cette action leur permet d''affronter les mois les plus froids avec davantage de protection et de dignité.'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        'es',
        'Charla solidaria en Institutos',
        'El equipo de comunicación estuvo impartiendo conferencias de concienciación en la península...',
        'El equipo de comunicación de Sunu Nit realizó diferentes charlas en centros educativos para acercar la realidad de los niños talibé y explicar la importancia de la cooperación directa. Estas actividades buscan sensibilizar a los jóvenes y fomentar una participación activa en proyectos solidarios.'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        'en',
        'Solidarity talks in schools',
        'The communication team has been giving awareness talks in schools across Spain...',
        'The Sunu Nit communication team organized different talks in educational centers to share the reality of talibé children and explain the importance of direct cooperation. These activities aim to raise awareness among young people and encourage active participation in solidarity projects.'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        'fr',
        'Conférences solidaires dans les écoles',
        'L''équipe de communication a organisé des conférences de sensibilisation dans plusieurs établissements...',
        'L''équipe de communication de Sunu Nit a organisé différentes conférences dans des établissements scolaires afin de présenter la réalité des enfants talibé et d''expliquer l''importance d''une coopération directe. Ces activités permettent de sensibiliser les jeunes et de favoriser leur participation aux projets solidaires.'
    ),
    (
        'b1000000-0000-4000-8000-000000000003',
        'es',
        'Ampliación de ducha sanitaria',
        'Terminada la reforma de la segunda estación de limpieza equipada con jabones biodegradables...',
        'Hemos finalizado la ampliación de una segunda zona de higiene equipada con duchas y productos básicos de limpieza. Este espacio permite que más niños puedan acceder a una higiene adecuada y reduce el riesgo de enfermedades relacionadas con la falta de recursos.'
    ),
    (
        'b1000000-0000-4000-8000-000000000003',
        'en',
        'Sanitary shower expansion',
        'The renovation of the second cleaning station equipped with biodegradable soaps has been completed...',
        'We have completed the expansion of a second hygiene area equipped with showers and essential cleaning products. This space allows more children to access proper hygiene and reduces health risks caused by the lack of resources.'
    ),
    (
        'b1000000-0000-4000-8000-000000000003',
        'fr',
        'Extension des douches sanitaires',
        'La rénovation de la deuxième station de nettoyage équipée de savons biodégradables est terminée...',
        'Nous avons terminé l''agrandissement d''un deuxième espace d''hygiène équipé de douches et de produits essentiels de nettoyage. Cet espace permet à davantage d''enfants d''accéder à une meilleure hygiène et réduit les risques liés au manque de ressources.'
    )
ON CONFLICT (news_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content;

INSERT INTO public.news_images (
    id,
    news_id,
    image_url,
    alt,
    sort_order
)
VALUES
    (
        'b2000000-0000-4000-8000-000000000001',
        'b1000000-0000-4000-8000-000000000001',
        'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?q=80&w=800',
        'Centro Sunu Nit',
        0
    ),
    (
        'b2000000-0000-4000-8000-000000000002',
        'b1000000-0000-4000-8000-000000000001',
        'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800',
        'Actividades Sunu Nit',
        1
    ),
    (
        'b2000000-0000-4000-8000-000000000003',
        'b1000000-0000-4000-8000-000000000001',
        'https://images.unsplash.com/photo-1584744646898-40ff0404e767?q=80&w=1170',
        'Niños en el centro Sunu Nit',
        2
    ),
    (
        'b2000000-0000-4000-8000-000000000004',
        'b1000000-0000-4000-8000-000000000002',
        'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800',
        'Charlas solidarias en institutos',
        0
    ),
    (
        'b2000000-0000-4000-8000-000000000005',
        'b1000000-0000-4000-8000-000000000002',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800',
        'Actividad educativa',
        1
    ),
    (
        'b2000000-0000-4000-8000-000000000006',
        'b1000000-0000-4000-8000-000000000002',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800',
        'Estudiantes participando',
        2
    ),
    (
        'b2000000-0000-4000-8000-000000000007',
        'b1000000-0000-4000-8000-000000000003',
        'https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=800',
        'Ampliación de duchas sanitarias',
        0
    ),
    (
        'b2000000-0000-4000-8000-000000000008',
        'b1000000-0000-4000-8000-000000000003',
        'https://images.unsplash.com/photo-1558000143-a6162383cce7?q=80&w=800',
        'Zona de higiene',
        1
    ),
    (
        'b2000000-0000-4000-8000-000000000009',
        'b1000000-0000-4000-8000-000000000003',
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=800',
        'Material sanitario',
        2
    )
ON CONFLICT (id) DO UPDATE SET
    news_id = EXCLUDED.news_id,
    image_url = EXCLUDED.image_url,
    alt = EXCLUDED.alt,
    sort_order = EXCLUDED.sort_order;

COMMIT;
