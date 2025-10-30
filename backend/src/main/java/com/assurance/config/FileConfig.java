package com.assurance.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration pour désactiver temporairement les fonctionnalités de fichiers
 * Cette configuration empêche Spring de charger les repositories de fichiers
 */
@Configuration
@ConditionalOnProperty(name = "app.file.enabled", havingValue = "false", matchIfMissing = false)
public class FileConfig {
    // Cette configuration sera activée seulement si app.file.enabled=false
    // Par défaut, les fonctionnalités de fichiers sont désactivées
}
