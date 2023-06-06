<?php

/*
 * This file is part of tohsakarat/table-of-content
 *
 * Copyright (c) 2022 Tomás Romero.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

use Flarum\Extend;
use s9e\TextFormatter\Configurator;
return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),
        
	
	    (new Extend\Formatter)
        ->configure(function (Configurator $config) {
            $config->BBCodes->addCustom(
        '[anchor="{TEXT}"]',
        '<div class="div-anchor">
        <span id={TEXT} class="anchor"></span> 
        <span id={TEXT} class="sub-anchor">{TEXT}</span> 
         </div>'
    );
        })
];
