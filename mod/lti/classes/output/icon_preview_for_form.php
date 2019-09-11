<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Preview icon to show on form
 *
 * @package   mod_lti
 * @copyright 2019 Davo Smith, Synergy Learning
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_lti\output;

use renderer_base;

defined('MOODLE_INTERNAL') || die();

/**
 * Preview icon to show on form
 *
 * @package mod_lti
 * @copyright 2019 Davo Smith, Synergy Learning
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class icon_preview_for_form implements \renderable, \templatable {
    /** @var object */
    protected $tool;
    /** @var array */
    protected $toolconfig;
    /** @var \cm_info|null */
    protected $coursemodule;
    /** @var object|null */
    protected $lti;

    /**
     * icon_preview_for_form constructor.
     * @param object $tool
     * @param array $toolconfig
     * @param \cm_info|null $coursemodule
     * @param object|null $lti
     */
    public function __construct($tool, $toolconfig, $coursemodule = null, $lti = null) {
        $this->tool = $tool;
        $this->toolconfig = $toolconfig;
        $this->coursemodule = $coursemodule;
        $this->lti = $lti;
    }

    /**
     * Export the data for the template
     * @param renderer_base $output
     * @return object
     */
    public function export_for_template(renderer_base $output) {
        $iconurl = lti_get_custom_icon_url($this->coursemodule, $this->lti, $this->tool, $this->toolconfig);
        if (!$iconurl) {
            $icon = new \pix_icon('icon', '', 'mod_lti');
            $iconurl = $output->image_url($icon->pix, $icon->component);
        }
        $description = lti_get_icon_source_description($this->coursemodule, $this->lti, $this->tool, $this->toolconfig);
        $data = (object)[
            'iconurl' => $iconurl->out(),
            'description' => $description,
        ];
        return $data;
    }
}
